/**
 * Pino ロギングシステム
 * 
 * ✅ 開発環境: カラー出力で見やすくフォーマット
 * ✅ 本番環境: 構造化ログ（JSON形式）
 * ✅ 最小限の情報表示（開発環境）
 */

import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

/**
 * 開発環境か判定
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Pino logger インスタンス
 * 
 * 開発環境: pino-pretty で見やすくフォーマット
 * 本番環境: JSON形式のまま
 */
const basePinoLogger = pino(
  {
    // ✅ ログレベル（環境変数で制御可能）
    level: process.env.LOG_LEVEL || 'info',

    // ✅ タイムスタンプフォーマット
    timestamp: pino.stdTimeFunctions.isoTime,

    // ✅ メタデータ（本番環境のみ）
    base: isDevelopment
      ? undefined
      : {
          env: process.env.NODE_ENV || 'development',
        },

    // ✅ traceId（本番環境のみ）
    mixin() {
      if (isDevelopment) {
        return {};
      }
      return {
        traceId: getTraceId(),
      };
    },
  },
  // ✅ 開発環境では pino-pretty を使用
  isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          translateTime: false,
          ignore: 'pid,hostname,time,env',
        },
      })
    : undefined,
);

/**
 * NestJS LoggerService インターフェースに適合させたラッパー
 */
const nestJsLoggerAdapter = {
  log(message: string, context?: string): void {
    basePinoLogger.info({ context }, message);
  },
};

// basePinoLogger に log メソッドを追加
export const pinoLogger = Object.assign(basePinoLogger, nestJsLoggerAdapter) as typeof basePinoLogger &
  typeof nestJsLoggerAdapter;

/**
 * traceId の管理（AsyncLocalStorage を使用）
 */
import { AsyncLocalStorage } from 'async_hooks';

const traceIdStorage = new AsyncLocalStorage<string>();

/**
 * traceId を取得（なければ生成）
 */
export function getTraceId(): string {
  let traceId = traceIdStorage.getStore();
  if (!traceId) {
    traceId = uuidv4();
  }
  return traceId;
}

/**
 * traceId を設定（リクエストハンドラー等で使用）
 */
export function setTraceId(traceId: string) {
  return traceIdStorage.run(traceId, () => {
    // コンテキスト内で実行
  });
}

/**
 * traceId でコンテキストを実行
 */
export async function withTraceId<T>(
  traceId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    traceIdStorage.run(traceId, async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
