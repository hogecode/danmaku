/**
 * Logger Service
 * 
 * Pino ロガーを注入可能にするサービス
 * ログレベル: TRACE < DEBUG < INFO < WARN < ERROR < FATAL
 */

import { Injectable, Inject } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';
import { getTraceId } from './pino.logger';

@Injectable()
export class LoggerService {
  constructor(@Inject('PINO_LOGGER') private readonly pinoLogger: PinoLogger) {}

  /**
   * Trace レベルでログを出力（最詳細）
   * 用途: 詳細なフロー追跡、パラメータ値などの内部情報
   */
  trace(message: string, metadata?: Record<string, any>) {
    this.pinoLogger.trace(
      {
        traceId: getTraceId(),
        ...metadata,
      },
      message,
    );
  }

  /**
   * Debug レベルでログを出力
   * 用途: 開発時の情報追跡、リクエスト/レスポンス、内部状態
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
   * Info レベルでログを出力（推奨デフォルト）
   * 用途: 重要なビジネスロジック、ユーザー操作、正常系の重要な進捗
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
   * Warn レベルでログを出力
   * 用途: 予期しない状況だが継続可能な状況、非推奨API使用
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
   * 用途: 処理失敗、例外、リトライ可能なエラー
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
   * Fatal レベルでログを出力（最重大）
   * 用途: システム停止を伴うエラー、リカバリ不可能なエラー
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
   * パフォーマンス計測用ロギング（DEBUG レベル）
   * 用途: 関数実行時間、クエリ実行時間などの計測
   */
  performance(functionName: string, durationMs: number, metadata?: Record<string, any>) {
    this.pinoLogger.debug(
      {
        traceId: getTraceId(),
        functionName,
        durationMs,
        ...metadata,
      },
      `⏱️ ${functionName} took ${durationMs}ms`,
    );
  }
}
