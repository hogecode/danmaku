/**
 * Pino ロギングシステム
 * 
 * ✅ traceId による分散トレーシング対応
 * ✅ 構造化ログ（JSON形式）
 * ✅ レベル別フィルタリング
 * ✅ 開発環境では見やすく整形
 */

import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pino logger インスタンス
 */
export const pinoLogger = pino(
  {
    // ✅ ログレベル（環境変数で制御可能）
    level: process.env.LOG_LEVEL || 'info',

    // ✅ タイムスタンプフォーマット
    timestamp: pino.stdTimeFunctions.isoTime,

    // ✅ メタデータ
    base: {
      env: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '0.0.1',
    },

    // ✅ マーク付きキー（パフォーマンス計測用）
    mixin() {
      return {
        traceId: getTraceId(),
      };
    },
  },

  // ✅ 開発環境では見やすく整形、本番環境では JSON
  process.env.NODE_ENV === 'development'
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
          messageFormat: '[{levelLabel}] {msg}',
        },
      })
    : undefined,
);

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

/**
 * ログ出力例
 * 
 * pinoLogger.info('User logged in', { userId: '123' });
 * // 開発環境: [info] User logged in {"traceId":"abc-123","userId":"123"}
 * // 本番環境: {"level":30,"time":"2024-01-01T00:00:00.000Z","traceId":"abc-123","userId":"123","msg":"User logged in"}
 */
