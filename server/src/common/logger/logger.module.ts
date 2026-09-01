/**
 * ロガーモジュール
 * 
 * Pino ロギングシステムを提供する NestJS モジュール
 */

import { Module, Global } from '@nestjs/common';
import { pinoLogger } from './pino.logger';
import { LoggerService } from './logger.service';

/**
 * Pino ロガーサービス
 */
@Global()
@Module({
  providers: [
    {
      provide: 'PINO_LOGGER',
      useValue: pinoLogger,
    },
    LoggerService,
  ],
  exports: ['PINO_LOGGER', LoggerService],
})
export class LoggerModule {}
