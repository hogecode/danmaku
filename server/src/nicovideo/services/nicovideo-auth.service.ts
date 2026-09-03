import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { nicovideo_auth_tokens } from '../../database/nicovideo.schema';
import { eq, and } from 'drizzle-orm';
import Redis from 'ioredis';
import { NicovideoApiClient as NicovideoApiClient } from '../utils/nicovideo-api.client';
import { NicovideoConstants } from '../constants/nicovideo.constants';

/**
 * ニコ動認証サービス
 * セッショントークン管理
 */
@Injectable()
export class NicovideoAuthService {
  private readonly logger = new Logger(NicovideoAuthService.name);
  private readonly REDIS_KEY_PREFIX = 'nicovideo:auth:';

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly apiClient: NicovideoApiClient,
  ) {}


  /**
   * セッションクッキーを取得
   */
  async getSessionCookie(userId: bigint): Promise<string> {
    // Redis から取得を試みる
    const redisKey = this.getRedisKey(userId);
    const cachedCookie = await this.redis.get(redisKey);

    if (cachedCookie) {
      this.logger.debug(`Redis からセッション取得: ${userId}`);
      return cachedCookie;
    }

    // DB から取得
    const token = await this.db
      .select()
      .from(nicovideo_auth_tokens)
      .where(eq(nicovideo_auth_tokens.user_id, userId))
      .limit(1);

    if (!token || token.length === 0) {
      throw new UnauthorizedException('ニコ動セッションが見つかりません。ログインしてください。');
    }

    const cookie = token[0].session_cookie;

    // Redis にキャッシュ
    await this.redis.setex(
      redisKey,
      24 * 60 * 60,
      cookie,
    );

    return cookie;
  }

  /**
   * ログアウト
   */
  async logout(userId: bigint): Promise<void> {
    try {
      // DB から削除
      await this.db
        .delete(nicovideo_auth_tokens)
        .where(eq(nicovideo_auth_tokens.user_id, userId));

      // Redis からも削除
      const redisKey = this.getRedisKey(userId);
      await this.redis.del(redisKey);

      this.logger.log(`ログアウト: ${userId}`);
    } catch (error) {
      this.logger.error(`ログアウトエラー: ${error}`);
      throw error;
    }
  }

  /**
   * トークンが存在するか確認
   */
  async hasValidSession(userId: bigint): Promise<boolean> {
    try {
      await this.getSessionCookie(userId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Redis キー生成
   */
  private getRedisKey(userId: bigint): string {
    return `${this.REDIS_KEY_PREFIX}${userId}`;
  }
}
