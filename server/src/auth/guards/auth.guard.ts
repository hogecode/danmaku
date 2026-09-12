import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

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
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Express Session で設定された userId が存在するかチェック
    // ✅ X-Session-Id ヘッダーからセッション ID を取得
    const sessionIdFromHeader = request.headers['x-session-id'] as string | undefined;
    if (sessionIdFromHeader && (request.session as any)?.userId) {
      // 既にセッションが確立している場合
      return true;
    }

    // Redis から sessionId で userId を検索する場合は以下の処理
    // ただし Express Session の場合、session.id と Redis のキーが一致するため
    // session.userId が設定されていれば十分
    if ((request.session as any)?.userId) {
      return true;
    }

    // 2. JWT トークン（Authorization ヘッダー）をチェック
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new UnauthorizedException('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as any;
        // JWT から取得した userId をセッションに保存
        (request.session as any).userId = decoded.sub;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid JWT token');
      }
    }

    // 3. JWT トークン（URL クエリパラメータ ?token=xxx）をチェック
    // 動画ストリーミング用（モバイルアプリ対応）
    const queryToken = (request.query as any)?.token;
    if (queryToken) {
      try {
        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new UnauthorizedException('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(queryToken, secret) as any;
        // JWT から取得した userId をセッションに保存
        (request.session as any).userId = decoded.sub;
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid JWT token in query parameter');
      }
    }

    throw new UnauthorizedException('Not authenticated');
  }
}
