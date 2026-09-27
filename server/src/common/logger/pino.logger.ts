/**
 * Pino ロギングシステム
 * 
 * ログレベル: trace(10) < debug(20) < info(30) < warn(40) < error(50) < fatal(60)
 * 
 * ✅ 開発環境: カラー出力で見やすくフォーマット、DEBUG レベル以上を表示
 * ✅ 本番環境: 構造化ログ（JSON形式）、INFO レベル以上を表示
 */

import pino from 'pino';
import pinoCaller from 'pino-caller';
import { v4 as uuidv4 } from 'uuid';

/**
 * 開発環境か判定
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * ログレベルの決定
 * 環境変数 LOG_LEVEL で制御可能
 * デフォルト: 開発環境=debug, 本番環境=info
 */
const getLogLevel = (): string => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return isDevelopment ? 'debug' : 'info';
};

/**
 * スタックトレースを見やすくフォーマット
 * @param stack - スタックトレース文字列
 * @param maxLines - 表示する最大行数
 * @returns フォーマット済みスタックトレース
 */
const formatStackTrace = (stack: string | undefined, maxLines: number = 10): string => {
  if (!stack) return '';
  return stack
    .split('\n')
    .slice(0, maxLines)
    .join('\n');
};

/**
 * エラーオブジェクトのシリアライザー
 * Pinoでエラーを構造化された形式で出力
 */
const errorSerializer = (err: any): Record<string, any> => {
  if (!err) return {};

  return {
    type: err.constructor?.name || 'Error',
    message: err.message,
    stack: formatStackTrace(err.stack),
    code: err.code,
  };
};

/**
 * Pino logger インスタンス
 * 
 * 開発環境: pino-pretty で見やすくフォーマット、DEBUG以上を表示
 * 本番環境: JSON形式で構造化ログ、INFO以上を表示
 */
let basePinoLogger = pino(
  {
    // ✅ ログレベル（環境変数で制御可能）
    level: getLogLevel(),

    // ✅ タイムスタンプフォーマット（ISO 8601）
    timestamp: pino.stdTimeFunctions.isoTime,

    // ✅ メタデータ（本番環境のみ）
    base: isDevelopment
      ? undefined
      : {
          env: process.env.NODE_ENV || 'production',
          version: process.env.APP_VERSION || 'unknown',
        },

    // ✅ トランザクションID（本番環境のみ、リクエスト追跡用）
    mixin() {
      if (isDevelopment) {
        return {};
      }
      return {
        traceId: getTraceId(),
      };
    },

    // ✅ エラーとカスタムフィールドのシリアライザー
    serializers: {
      error: errorSerializer,
      err: errorSerializer,
    },
  },
  // ✅ 開発環境では pino-pretty を使用（見やすくフォーマット）
  isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,  // ✅ マルチラインでスタックトレースを見やすく
          translateTime: false,
          // ✅ スタックトレースを表示、その他の不要なメタデータを隠す
          ignore: 'pid,hostname,time,env,version',
          // ログレベルをラベル表示
          levelLabel: 'level',
          // ✅ スタックトレースを別行で表示
          messageFormat: '{levelLabel} - {msg}',
        },
      })
    : undefined,
);

// ✅ pinoCaller を適用してファイル・行番号情報を追加
// 本番環境: caller 情報を JSON フィールドとして自動出力
if (!isDevelopment) {
  basePinoLogger = pinoCaller(basePinoLogger, { 
    relativeTo: process.cwd(),
  });
}

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
