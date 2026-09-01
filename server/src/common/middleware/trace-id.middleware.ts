/**
 * Trace ID Middleware
 * 
 * リクエストごとに traceId を生成・設定し、
 * レスポンスヘッダーに付与する
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pinoLogger } from '../logger/pino.logger';

/**
 * X-Trace-ID ヘッダーキー
 */
const TRACE_ID_HEADER = 'x-trace-id';

/**
 * traceId を設定するミドルウェア
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // ✅ リクエストヘッダーから traceId を取得、または新規生成
    const traceId = (req.get(TRACE_ID_HEADER) as string) || uuidv4();

    // ✅ req オブジェクトに traceId を付与
    (req as any).traceId = traceId;

    // ✅ レスポンスヘッダーに traceId を付与
    res.setHeader(TRACE_ID_HEADER, traceId);

    // ✅ リクエストログを出力
    pinoLogger.info(
      {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
      `${req.method} ${req.url}`,
    );

    // ✅ レスポンス完了時にログを出力
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      pinoLogger.info(
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        },
        `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
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
