import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService, TokenService, UserService, OAuthAccountService } from './services';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';

/**
 * Google OAuth 認証モジュール
 */
@Module({
  imports: [ConfigModule, DatabaseModule, RedisModule],
  controllers: [AuthController],
  providers: [TokenService, UserService, OAuthAccountService, AuthService],
  exports: [AuthService, TokenService, UserService, OAuthAccountService],
})
export class AuthModule {}
