import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { pinoLogger } from '../../common/logger/pino.logger';
import { NicovideoDownloadJobData } from './nicovideo-download.job';

/**
 * ニコ動ダウンロード用のキュー定義・管理
 */
@Injectable()
export class NicovideoDownloadQueue {
  private queue: Queue<NicovideoDownloadJobData>;

  constructor(private readonly configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    const redisConfig: any = {
      host: redisHost,
      port: redisPort,
      enableOfflineQueue: false,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    if (redisPassword) {
      redisConfig.password = redisPassword;
    }

    const connection = new Redis(redisConfig);

    this.queue = new Queue<NicovideoDownloadJobData>(
      'nicovideo-download',
      {
        connection,
      },
    );

    // イベントハンドラ登録
    this.queue.on('error', (error) => {
      pinoLogger.error({ error }, 'NicovideoDownloadQueue Error');
    });

    pinoLogger.info('✅ NicovideoDownloadQueue initialized');
  }

  /**
   * キューインスタンスを取得
   */
  getQueue(): Queue<NicovideoDownloadJobData> {
    return this.queue;
  }

  /**
   * キューをクローズ
   */
  async closeQueue(): Promise<void> {
    await this.queue.close();
    pinoLogger.info('NicovideoDownloadQueue closed');
  }
}
