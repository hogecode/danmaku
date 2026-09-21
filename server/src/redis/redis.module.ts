import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { pinoLogger } from '../common/logger/pino.logger';

/**
 * Redis クライアント提供モジュール
 * 複数のモジュールで共用される Redis インスタンスを提供
 */
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = configService.get<number>('REDIS_PORT') || 6379;
        const db = configService.get<number>('REDIS_DB') || 0;
        const password = configService.get<string>('REDIS_PASSWORD');

        const redisConfig: any = {
          host,
          port,
          db,
          enableOfflineQueue: false,
          enableReadyCheck: false,
          // ✅ 再接続の設定（ioredis のビルトイン再接続機構）
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            pinoLogger.warn(`Redis reconnect attempt ${times}, retrying in ${delay}ms...`);
            return delay;
          },
          maxRetriesPerRequest: null,
        };

        if (password) {
          redisConfig.password = password;
        }

        // ✅ デバッグ：ConfigService から読み込んだ値を確認
        pinoLogger.info({
          configServiceHost: host,
          configServicePort: port,
          configServiceDb: db,
          configServiceHasPassword: !!password,
          processEnvREDIS_HOST: process.env.REDIS_HOST,
          processEnvREDIS_PORT: process.env.REDIS_PORT,
          processEnvREDIS_DB: process.env.REDIS_DB,
        }, '🔍 RedisModule initializing');

        const redis = new Redis(redisConfig);

        // ✅ ioredis エラーハンドラを登録（予期しない接続切断時のプロセスクラッシュを防止）
        redis.on('error', (err) => {
          pinoLogger.error({ err }, 'Redis Client Error (ioredis)');
        });

        redis.on('connect', () => {
          pinoLogger.info('✅ Redis connected (ioredis)');
        });

        redis.on('reconnecting', () => {
          pinoLogger.warn('Redis reconnecting (ioredis)...');
        });

        redis.on('ready', () => {
          pinoLogger.info('✅ Redis ready (ioredis)');
        });

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
