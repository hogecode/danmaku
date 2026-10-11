import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { LoggerService } from '../common/logger/logger.service';

/**
 * ニコ動 SSE（Server-Sent Events）管理サービス
 * ダウンロード進捗をリアルタイムで配信
 */
@Injectable()
export class NicovideoSSEService {
  private subscribers: Map<string, any> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * SSE クライアントを登録
   */
  registerClient(
    jobId: string,
    res: any,
  ): () => Promise<void> {
    const redis = new Redis(
      this.configService.get<number>('REDIS_PORT') || 6379,
      this.configService.get<string>('REDIS_HOST') || 'localhost',
    );

    const channel = `nicovideo-download:${jobId}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    redis.subscribe(channel, (err) => {
      if (err) {
        this.logger.error(`SSE 購読失敗: ${channel}`, err);
        res.status(500).json({ error: '購読失敗' });
      }
    });

    redis.on('message', (chan, message) => {
      if (chan === channel) {
        try {
          const event = JSON.parse(message);
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        } catch (error) {
          this.logger.error(`SSE メッセージ送信失敗: ${channel}`, error as Error);
        }
      }
    });

    const unsubscribe = async () => {
      await redis.unsubscribe(channel);
      await redis.disconnect();
      this.subscribers.delete(jobId);
      this.logger.debug(`SSE クライアント登録解除: ${jobId}`, { jobId });
    };

    this.subscribers.set(jobId, { res, redis });

    res.on('close', async () => {
      await unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * すべてのクライアント接続をクローズ
   */
  async closeAll(): Promise<void> {
    for (const [jobId, { redis, res }] of this.subscribers.entries()) {
      try {
        res.end();
        await redis.disconnect();
      } catch (error) {
        this.logger.error(`SSE クローズ失敗: ${jobId}`, error as Error);
      }
    }
    this.subscribers.clear();
  }
}
