import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import {
  AuthService,
  TokenService,
  UserService,
  OAuthAccountService,
} from './services';
import {
  GoogleAuthService,
  OnedriveAuthService,
  GoogleTokenService,
  OnedriveTokenService,
} from './services/providers/index';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { LoggerModule } from '../common/logger/logger.module';

/**
 * OAuth 認証モジュール（マルチプロバイダー対応）
 * 
 * 提供サービス：
 * - Google OAuth & Token
 * - OneDrive OAuth & Token
 * - 共通認証＆トークン管理ロジック
 */
@Module({
  imports: [ConfigModule, DatabaseModule, RedisModule, LoggerModule],
  controllers: [AuthController],
  providers: [
    GoogleTokenService,
    OnedriveTokenService,
    TokenService,
    UserService,
    OAuthAccountService,
    GoogleAuthService,
    OnedriveAuthService,
    AuthService,
  ],
  exports: [
    AuthService,
    TokenService,
    UserService,
    OAuthAccountService,
    GoogleAuthService,
    OnedriveAuthService,
    GoogleTokenService,
    OnedriveTokenService,
  ],
})
export class AuthModule {}
