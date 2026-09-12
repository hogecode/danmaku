/**
 * Common Module
 * 
 * 共通の middleware、interceptor、logger を提供
 */

import { Module, Global } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { EncryptionModule } from './encryption/encryption.module';
import { OAuthStateService } from './oauth/oauth-state.service';

@Global()
@Module({
  imports: [LoggerModule, EncryptionModule],
  providers: [OAuthStateService],
  exports: [LoggerModule, EncryptionModule, OAuthStateService],
})
export class CommonModule {}
