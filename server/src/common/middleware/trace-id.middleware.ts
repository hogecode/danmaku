/**
 * Trace ID Middleware
 * 
 * リクエストごとに traceId を生成・設定し、
 * AsyncLocalStorage にコンテキストを保存することで
 * リクエスト全体のライフサイクル（サービス層など）で
 * traceId を自動引き継ぎ可能にする
 * 
 * 開発環境では最小限のログ出力
 * 本番環境では traceId を含めて詳細ログ出力
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pinoLogger, withTraceId } from '../logger/pino.logger';

/**
 * X-Trace-ID ヘッダーキー
 */
const TRACE_ID_HEADER = 'x-trace-id';

/**
 * 開発環境か判定
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * HTTP メソッドのログレベルを決定
 */
function getLogLevel(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warn';
  return 'info';
}

/**
 * traceId を設定するミドルウェア
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // ✅ リクエストヘッダーから traceId を取得、または新規生成
    const traceId = (req.get(TRACE_ID_HEADER) as string) || uuidv4();

    // ✅ req オブジェクトに traceId を付与（Express の Request で直接アクセス可能）
    (req as any).traceId = traceId;

    // ✅ レスポンスヘッダーに traceId を付与（本番環境のみ）
    if (!isDevelopment) {
      res.setHeader(TRACE_ID_HEADER, traceId);
    }

    // ✅ AsyncLocalStorage にコンテキストを設定して、
    //    next() 以降の処理（サービス層など）で traceId を自動引き継ぎ
    withTraceId(traceId, async () => {
      // ✅ レスポンス完了時にログを出力
      const startTime = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = getLogLevel(res.statusCode);

        // 開発環境: シンプルな1行ログ
        if (isDevelopment) {
          const logMessage = `${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`;
          pinoLogger[logLevel](logMessage);
        } else {
          // 本番環境: 詳細ログ（traceId付き）
          pinoLogger[logLevel](
            {
              method: req.method,
              url: req.url,
              statusCode: res.statusCode,
              duration: `${duration}ms`,
              traceId,
              ip: req.ip,
            },
            `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
          );
        }
      });

      // ✅ next() を実行（AsyncLocalStorage のコンテキスト内で実行）
      next();
    });
  }
}

/**
 * Express Request オブジェクトに traceId を追加
 */
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}
