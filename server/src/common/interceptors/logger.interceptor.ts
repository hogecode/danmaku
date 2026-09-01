/**
 * Logger Interceptor
 * 
 * すべての API リクエスト・レスポンスをログ出力
 * traceId 付き
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';
import { pinoLogger } from '../logger/pino.logger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, traceId } = request;

    // ✅ リクエストボディをログ
    pinoLogger.debug(
      {
        traceId,
        method,
        url,
        body: request.body,
        query: request.query,
      },
      `[Request] ${method} ${url}`,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;

        // ✅ レスポンスをログ
        pinoLogger.debug(
          {
            traceId,
            method,
            url,
            duration: `${duration}ms`,
            response: data,
          },
          `[Response] ${method} ${url} - ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // ✅ エラーをログ
        pinoLogger.error(
          {
            traceId,
            method,
            url,
            duration: `${duration}ms`,
            error: error.message,
            stack: error.stack,
          },
          `[Error] ${method} ${url} - ${error.message}`,
        );

        throw error;
      }),
    );
  }
}
