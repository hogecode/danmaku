/**
 * Common Module
 * 
 * 共通の middleware、interceptor、logger を提供
 */

import { Module, Global } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { EncryptionModule } from './encryption/encryption.module';
import { RedisModule } from '../redis/redis.module';
import { OAuthStateService } from './oauth/oauth-state.service';
import { S3StorageService } from './storage/s3-storage.service';
import { LoggerService } from './logger/logger.service';

@Global()
@Module({
  imports: [LoggerModule, EncryptionModule, RedisModule],
  providers: [OAuthStateService, S3StorageService],
  exports: [LoggerModule, EncryptionModule, RedisModule, OAuthStateService, S3StorageService],
})
export class CommonModule {}
