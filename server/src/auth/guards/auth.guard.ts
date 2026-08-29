import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * セッションベースの認証ガード
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // express-session で設定された userId が存在するかチェック
    if (!(request.session as any)?.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    return true;
  }
}
