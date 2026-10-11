import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../../common/logger/logger.service';
import {
  NicovideoDownloadJobData,
  NicovideoDownloadJobResult,
} from '../queues/nicovideo-download.job';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

/**
 * ニコ動ダウンロード管理サービス
 * BullMQ キューとの連携、ジョブ管理
 */
@Injectable()
export class NicovideoDownloadService {
  private redis!: Redis;

  constructor(
    @InjectQueue('nicovideo-download')
    private readonly downloadQueue: Queue<NicovideoDownloadJobData>,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.initializeRedis();
  }

  private initializeRedis(): void {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    const config: any = { host: redisHost, port: redisPort };
    if (redisPassword) config.password = redisPassword;

    this.redis = new Redis(config);
  }

  /**
   * ダウンロードジョブを開始（キューに追加）
   */
  async startDownload(
    videoId: string,
    quality: 'high' | 'low' | 'auto' = 'auto',
    downloadComments: boolean = false,
    userId?: string,
  ): Promise<{ jobId: string; status: string; message: string }> {
    try {
      const jobId = `job_${Date.now()}_${uuidv4().substring(0, 8)}`;

      const jobData: NicovideoDownloadJobData = {
        jobId,
        videoId,
        quality,
        downloadComments,
        downloadedAt: new Date(),
        userId,
      };

      const job = await this.downloadQueue.add('download-task', jobData, {
        jobId,
        attempts: this.configService.get<number>('NICOVIDEO_DOWNLOAD_MAX_RETRIES') || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      this.logger.info(`ダウンロードジョブ追加: ${videoId} (Job ID: ${jobId})`, {
        jobId,
        videoId,
        quality,
        downloadComments,
      });

      return {
        jobId,
        status: 'queued',
        message: 'ダウンロードを開始しました',
      };
    } catch (error) {
      this.logger.error(`ダウンロードジョブ追加失敗: ${videoId}`, error as Error);
      throw error;
    }
  }

  /**
   * ジョブの状態を確認
   */
  async getJobStatus(jobId: string): Promise<any> {
    try {
      const job = await this.downloadQueue.getJob(jobId);

      if (!job) {
        return {
          jobId,
          status: 'not_found',
          message: 'ジョブが見つかりません',
        };
      }

      const state = await job.getState();
      const progress = job.progress;
      const result = job.returnvalue as NicovideoDownloadJobResult | null;

      return {
        jobId,
        status: state,
        progress,
        result,
      };
    } catch (error) {
      this.logger.error(`ジョブ状態確認失敗: ${jobId}`, error as Error);
      throw error;
    }
  }

  /**
   * ジョブをキャンセル
   * - queued/delayed/paused状態のジョブは削除
   * - active状態のジョブはスキップ（Worker が処理中）
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.downloadQueue.getJob(jobId);

      if (!job) {
        this.logger.warn(`キャンセル対象ジョブが見つかりません: ${jobId}`);
        return false;
      }

      try {
        await job.remove();
        this.logger.info(`ジョブを削除: ${jobId}`, { jobId });
        return true;
      } catch (removeError: any) {
        // ロックされている場合（active状態）はスキップ
        if (removeError.message?.includes('locked')) {
          const state = await job.getState();
          this.logger.warn(`ジョブは実行中のため削除できません: ${jobId}`, { jobId, state });
          return false;
        } else {
          throw removeError;
        }
      }
    } catch (error) {
      this.logger.error(`ジョブキャンセル失敗: ${jobId}`, error as Error);
      throw error;
    }
  }

  /**
   * Redis Pub/Sub で進捗をリッスン（SSE用）
   */
  subscribeToProgress(
    jobId: string,
    callback: (event: any) => void,
  ): () => Promise<void> {
    const pubsub = new Redis(
      this.configService.get<number>('REDIS_PORT') || 6379,
      this.configService.get<string>('REDIS_HOST') || 'localhost',
    );

    const channel = `nicovideo-download:${jobId}`;

    pubsub.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(`購読失敗: ${channel}`, err);
      }
    });

    pubsub.on('message', (chan, message) => {
      if (chan === channel) {
        try {
          const event = JSON.parse(message);
          callback(event);
        } catch (error) {
          this.logger.error(`メッセージパース失敗: ${channel}`, error as Error);
        }
      }
    });

    // 購読解除関数を返す
    return async () => {
      await pubsub.unsubscribe(channel);
      await pubsub.disconnect();
    };
  }
}
