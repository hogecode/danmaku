import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';

/**
 * Redis ベースのレート制限ガード
 * IP アドレスごとに 1 分間に 5 回以上のリクエストを拒否
 * TODO: Redis クライアントの接続エラーやタイムアウトのハンドリングを追加することを検討
 * TODO: IP アドレスの取得方法を改善することを検討（例: X-Forwarded-For ヘッダーの信頼性）
 * TODO: レートリミットの制限を見直す
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowMs = 60 * 1000; // 1分
  private readonly maxRequests = 5;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const key = `rate-limit:auth:${ip}`;

    try {
      const count = await this.redis.incr(key);

      if (count === 1) {
        // 初回リクエストの場合、キーの有効期限を設定
        await this.redis.pexpire(key, this.windowMs);
      }

      if (count > this.maxRequests) {
        // 残りTTLを取得
        const ttl = await this.redis.pttl(key);
        throw new HttpException(
          `Rate limit exceeded. Try again in ${Math.ceil(ttl / 1000)} seconds.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error: any) {
      // TooManyRequestsException（HTTP 429）の場合は再スロー
      if (error?.status === 429 || error?.name === 'TooManyRequestsException') {
        throw error;
      }
      // Redis その他のエラーの場合はリクエストを許可（フェイルオープン）
      console.error('Rate limit guard error:', error);
      return true;
    }
  }

  /**
   * クライアント IP アドレスを取得
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return (
      request.ip ||
      request.socket.remoteAddress ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }
}
