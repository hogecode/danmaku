/**
 * Common Module
 * 
 * 共通の middleware、interceptor、logger を提供
 */

import { Module, Global } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { EncryptionModule } from './encryption/encryption.module';

@Global()
@Module({
  imports: [LoggerModule, EncryptionModule],
  exports: [LoggerModule, EncryptionModule],
})
export class CommonModule {}
