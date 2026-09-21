import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

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
            console.warn(`⏳ Redis reconnect attempt ${times}, retrying in ${delay}ms...`);
            return delay;
          },
          maxRetriesPerRequest: null,
        };

        if (password) {
          redisConfig.password = password;
        }

        const redis = new Redis(redisConfig);

        // ✅ ioredis エラーハンドラを登録（予期しない接続切断時のプロセスクラッシュを防止）
        redis.on('error', (err) => {
          console.error('❌ Redis Client Error (ioredis):', err);
        });

        redis.on('connect', () => {
          console.log('✅ Redis connected (ioredis)');
        });

        redis.on('reconnecting', () => {
          console.warn('⏳ Redis reconnecting (ioredis)...');
        });

        redis.on('ready', () => {
          console.log('✅ Redis ready (ioredis)');
        });

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
