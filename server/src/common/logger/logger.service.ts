/**
 * Logger Service
 * 
 * Pino ロガーを注入可能にするサービス
 * 各モジュールで使用
 */

import { Injectable, Inject } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';
import { getTraceId } from './pino.logger';

@Injectable()
export class LoggerService {
  constructor(@Inject('PINO_LOGGER') private readonly pinoLogger: PinoLogger) {}

  /**
   * Info レベルでログを出力
   */
  info(message: string, metadata?: Record<string, any>) {
    this.pinoLogger.info(
      {
        traceId: getTraceId(),
        ...metadata,
      },
      message,
    );
  }

  /**
   * Debug レベルでログを出力
   */
  debug(message: string, metadata?: Record<string, any>) {
    this.pinoLogger.debug(
      {
        traceId: getTraceId(),
        ...metadata,
      },
      message,
    );
  }

  /**
   * Warn レベルでログを出力
   */
  warn(message: string, metadata?: Record<string, any>) {
    this.pinoLogger.warn(
      {
        traceId: getTraceId(),
        ...metadata,
      },
      message,
    );
  }

  /**
   * Error レベルでログを出力
   */
  error(message: string, error?: Error | any, metadata?: Record<string, any>) {
    this.pinoLogger.error(
      {
        traceId: getTraceId(),
        error: error?.message || error,
        stack: error?.stack,
        ...metadata,
      },
      message,
    );
  }

  /**
   * Fatal レベルでログを出力
   */
  fatal(message: string, error?: Error | any, metadata?: Record<string, any>) {
    this.pinoLogger.fatal(
      {
        traceId: getTraceId(),
        error: error?.message || error,
        stack: error?.stack,
        ...metadata,
      },
      message,
    );
  }

  /**
   * パフォーマンス計測用ロギング
   */
  performance(functionName: string, durationMs: number, metadata?: Record<string, any>) {
    this.pinoLogger.info(
      {
        traceId: getTraceId(),
        functionName,
        durationMs,
        ...metadata,
      },
      `[Performance] ${functionName} took ${durationMs}ms`,
    );
  }
}
