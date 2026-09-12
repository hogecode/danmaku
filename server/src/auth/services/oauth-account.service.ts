import {
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import { TokenService } from './token.service';
import { RefreshTokenResponseDto } from '../dto';
import { LoggerService } from '../../common/logger/logger.service';
import { ProviderType } from '../../drive/constants';

/**
 * マルチプロバイダー OAuth アカウント管理サービス
 * Google, OneDrive 対応
 */
@Injectable()
export class OAuthAccountService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly tokenService: TokenService,
    private readonly Logger: LoggerService
  ) {}

  /**
   * OAuth アカウント情報を保存
   */
  async upsertOAuthAccount(
    userId: bigint,
    userInfo: any,
    tokenData: any,
    provider: string = ProviderType.GOOGLE,
  ) {
    const accessTokenExpiresAt = this.tokenService.calculateTokenExpiration(
      tokenData.expires_in,
    );
    const refreshTokenExpiresAt = tokenData.refresh_token
      ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      : null;

    const now = new Date();
    this.Logger.debug(`${provider} user:`, userInfo);

    const existingOAuth = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, provider),
      ),
    });

    if (existingOAuth) {
      await this.db
        .update(oauthAccounts)
        .set({
          provider_user_id: userInfo.sub,
          provider_email: userInfo.email,
          access_token: tokenData.access_token,
          refresh_token:
            tokenData.refresh_token || existingOAuth.refresh_token,
          access_token_expires_at: accessTokenExpiresAt,
          refresh_token_expires_at: refreshTokenExpiresAt,
          updated_at: now,
        })
        .where(eq(oauthAccounts.id, existingOAuth.id));
    } else {
      await this.db.insert(oauthAccounts).values({
        user_id: userId,
        provider_name: provider,
        provider_user_id: userInfo.sub,
        provider_email: userInfo.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        created_at: now,
        updated_at: now,
      });
    }
  }

  /**
   * 有効なアクセストークンを取得
   * トークンが期限切れの場合は自動的にリフレッシュして返す
   *
   * @param userId - ユーザーID
   * @param provider - プロバイダー名
   * @returns 有効なアクセストークン
   */
  async getValidAccessToken(userId: bigint, provider: string = ProviderType.GOOGLE): Promise<string> {
    return await this.tokenService.getValidAccessToken(userId, provider);
  }

  /**
   * ログアウト処理（全プロバイダーのトークンを無効化）
   */
  async logout(userId: bigint): Promise<void> {
    const oauths = await this.db.query.oauthAccounts.findMany({
      where: eq(oauthAccounts.user_id, userId),
    });

    for (const oauth of oauths) {
      if (oauth.access_token) {
        await this.tokenService.revokeToken(oauth.access_token, oauth.provider_name);
      }
    }
  }
}
