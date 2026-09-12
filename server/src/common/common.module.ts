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

@Global()
@Module({
  imports: [LoggerModule, EncryptionModule, RedisModule],
  providers: [OAuthStateService],
  exports: [LoggerModule, EncryptionModule, RedisModule, OAuthStateService],
})
export class CommonModule {}
