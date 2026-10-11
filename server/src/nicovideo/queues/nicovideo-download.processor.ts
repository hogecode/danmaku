import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import {
  NicovideoDownloadJobData,
  NicovideoDownloadJobResult,
  NicovideoDownloadProgress,
} from './nicovideo-download.job';
import Redis from 'ioredis';

/**
 * ニコ動ダウンロードワーカー（Processor）
 */
@Processor('nicovideo-download')
@Injectable()
export class NicovideoDownloadProcessor extends WorkerHost {
  private redis!: Redis;
  private browser: Browser | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly s3Storage: S3StorageService,
  ) {
    super();
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

  async process(job: Job<NicovideoDownloadJobData>): Promise<NicovideoDownloadJobResult> {
    const { jobId, videoId } = job.data;

    try {
      this.logger.info(`ニコ動ダウンロード開始: ${videoId} (Job: ${jobId})`, {
        jobId,
        videoId,
      });

      await this.publishProgress(jobId, {
        step: 'initializing',
        percentage: 5,
        message: 'ブラウザを初期化中...',
      });

      this.browser = await chromium.launch({
        headless: this.configService.get<string>('PLAYWRIGHT_HEADLESS') === 'true',
      });

      const context = await this.browser.newContext();
      const page = await context.newPage();

      await this.publishProgress(jobId, {
        step: 'accessing_nicovideo',
        percentage: 10,
        message: 'ニコ動にアクセス中...',
      });

      const videoUrl = `https://www.nicovideo.jp/watch/${videoId}`;
      await page.goto(videoUrl, { waitUntil: 'networkidle' });

      const videoTitle = await this.extractVideoTitle(page);
      const videoDuration = await this.extractVideoDuration(page);

      await this.publishProgress(jobId, {
        step: 'downloading_video',
        percentage: 20,
        message: '動画をダウンロード中...',
      });

      const downloadedFilePath = await this.downloadVideo(page, videoId);

      await this.publishProgress(jobId, {
        step: 'uploading_s3',
        percentage: 70,
        message: 'S3 にアップロード中...',
      });

      const fileName = `${videoId}_${Date.now()}.mp4`;
      const s3Key = this.s3Storage.buildS3Key(fileName);
      await this.s3Storage.uploadFile(downloadedFilePath, s3Key);

      const s3Url = await this.s3Storage.generatePresignedUrl(s3Key);
      const fileSize = fs.statSync(downloadedFilePath).size;

      fs.unlinkSync(downloadedFilePath);

      const result: NicovideoDownloadJobResult = {
        jobId,
        videoId,
        fileName,
        s3Key,
        s3Url,
        fileSize,
        duration: videoDuration,
        title: videoTitle,
        commentCount: 0,
        completedAt: new Date(),
      };

      await this.publishProgress(jobId, {
        step: 'completed',
        percentage: 100,
        message: 'ダウンロード完了',
      });

      await context.close();
      if (this.browser) await this.browser.close();

      return result;
    } catch (error) {
      this.logger.error(`ニコ動ダウンロード失敗: ${videoId}`, error as Error);
      if (this.browser) await this.browser.close();
      throw error;
    }
  }

  private async extractVideoTitle(page: Page): Promise<string> {
    try {
      const title = await page.locator('h1[class*="VideoTitle"]').textContent();
      return title?.trim() || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private async extractVideoDuration(page: Page): Promise<number> {
    try {
      const durationText = await page.locator('[class*="Duration"]').textContent();
      if (!durationText) return 0;
      const match = durationText.match(/(\d+):(\d+)/);
      if (match) {
        return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  private async downloadVideo(page: Page, videoId: string): Promise<string> {
    try {
      const downloadPromise = page.waitForEvent('download');
      await page.click('[class*="DownloadButton"]').catch(() => {
        this.logger.warn(`DLボタンが見つかりません (${videoId})`);
      });

      const download = await downloadPromise;
      const tempDir = path.join('./downloads', videoId);
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const savePath = path.join(tempDir, download.suggestedFilename());
      await download.saveAs(savePath);
      return savePath;
    } catch (error) {
      this.logger.error(`動画DL失敗: ${videoId}`, error as Error);
      throw error;
    }
  }

  private async publishProgress(
    jobId: string,
    progress: Omit<NicovideoDownloadProgress, 'timestamp'>,
  ): Promise<void> {
    try {
      await this.redis.publish(
        `nicovideo-download:${jobId}`,
        JSON.stringify({ jobId, type: 'progress', progress: { ...progress, timestamp: new Date() } }),
      );
    } catch (error) {
      this.logger.error(`進捗発行失敗: ${jobId}`, error as Error);
    }
  }
}
