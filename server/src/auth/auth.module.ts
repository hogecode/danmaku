import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AuthController } from './auth.controller';
import { AuthService, TokenService, UserService, OAuthAccountService } from './services';
import { DatabaseModule } from '../database/database.module';

/**
 * Google OAuth 認証モジュール
 */
@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [AuthController],
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
    TokenService,
    UserService,
    OAuthAccountService,
    AuthService,
  ],
  exports: [AuthService, TokenService, UserService, OAuthAccountService],
})
export class AuthModule {}
