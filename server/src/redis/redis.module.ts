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
        };

        if (password) {
          redisConfig.password = password;
        }

        return new Redis(redisConfig);
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
