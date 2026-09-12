import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * セッション + JWT + sessionId の複数認証方式に対応したガード
 * 
 * 認証優先順序：
 * 1. Express Session（Cookie）
 * 2. X-Session-Id ヘッダー（モバイルアプリ用）
 * 3. JWT（Authorization ヘッダー）
 * 4. JWT（URL クエリパラメータ - 動画ストリーミング用）
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly logger: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // ✅ デバッグログ
    this.logger.debug('[AuthGuard] Auth check', {
      sessionId: (request.session as any)?.id,
      userId: (request.session as any)?.userId,
      headerSessionId: request.headers['x-session-id'],
      authHeader: !!request.headers.authorization,
    });

    // 1. Express Session で設定された userId が存在するかチェック
    if ((request.session as any)?.userId) {
      this.logger.debug('[AuthGuard] ✅ Authenticated via Express Session', {
        userId: (request.session as any).userId,
      });
      return true;
    }

    // 2. X-Session-Id ヘッダーをチェック（モバイルアプリ用）
    const sessionIdFromHeader = request.headers['x-session-id'] as string | undefined;
    if (sessionIdFromHeader) {
      // ✅ Express Session の中にこのヘッダーの sessionId がある場合は認証成功
      // Cookie ベースの Express Session がある場合はそちらを使用
      if ((request.session as any)?.userId) {
        this.logger.debug('[AuthGuard] ✅ Authenticated via Express Session with X-Session-Id', {
          userId: (request.session as any).userId,
          sessionId: sessionIdFromHeader,
        });
        return true;
      }

      // ✅ Redis から直接セッション情報を取得（モバイル Deep Link 経由のセッション）
      try {
        // ✅ カスタムキー: auth:session:<sessionId>
        const redisKey = `auth:session:${sessionIdFromHeader}`;
        const sessionData = await this.redis.get(redisKey);
        
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const userId = session.userId;
          
          if (userId) {
            // ✅ Express Session に userId を設定（以降のリクエストで利用可能）
            (request.session as any).userId = userId;
            this.logger.debug('[AuthGuard] ✅ Authenticated via X-Session-Id (from Redis cache)', {
              userId,
              sessionId: sessionIdFromHeader,
              redisKey,
            });
            return true;
          }
        }

        this.logger.warn('[AuthGuard] ⚠️ X-Session-Id session data not found in Redis', {
          sessionId: sessionIdFromHeader,
          redisKey,
        });
      } catch (error) {
        this.logger.error('[AuthGuard] Failed to retrieve session from Redis', error, {
          sessionId: sessionIdFromHeader,
        });
      }
    }

    // 3. JWT トークン（Authorization ヘッダー）をチェック
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          this.logger.error('[AuthGuard] JWT_SECRET not configured');
          throw new UnauthorizedException('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as any;
        // JWT から取得した userId をセッションに保存
        (request.session as any).userId = decoded.sub;
        this.logger.debug('[AuthGuard] ✅ Authenticated via JWT (Authorization header)', {
          userId: decoded.sub,
        });
        return true;
      } catch (error) {
        this.logger.error('[AuthGuard] JWT verification failed', error);
        throw new UnauthorizedException('Invalid JWT token');
      }
    }

    // 4. JWT トークン（URL クエリパラメータ ?token=xxx）をチェック
    // 動画ストリーミング用（モバイルアプリ対応）
    const queryToken = (request.query as any)?.token;
    if (queryToken) {
      try {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          this.logger.error('[AuthGuard] JWT_SECRET not configured');
          throw new UnauthorizedException('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(queryToken, secret) as any;
        // JWT から取得した userId をセッションに保存
        (request.session as any).userId = decoded.sub;
        this.logger.debug('[AuthGuard] ✅ Authenticated via JWT (query parameter)', {
          userId: decoded.sub,
        });
        return true;
      } catch (error) {
        this.logger.error('[AuthGuard] JWT verification failed (query parameter)', error);
        throw new UnauthorizedException('Invalid JWT token in query parameter');
      }
    }

    // ❌ 認証失敗
    this.logger.error('[AuthGuard] ❌ Not authenticated', {
      hasSession: !!request.session,
      hasUserId: !!(request.session as any)?.userId,
      hasAuthHeader: !!authHeader,
      hasQueryToken: !!queryToken,
      hasSessionHeader: !!sessionIdFromHeader,
    });
    throw new UnauthorizedException('Not authenticated');
  }
}
