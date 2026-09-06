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
 * セッション + JWT の両方に対応した認証ガード
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. express-session で設定された userId が存在するかチェック
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

    throw new UnauthorizedException('Not authenticated');
  }
}
