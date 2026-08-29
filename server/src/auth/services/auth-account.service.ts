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

/**
 * OAuth アカウント管理サービス
 */
@Injectable()
export class OAuthAccountService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * OAuth アカウント情報を保存
   */
  async upsertOAuthAccount(
    userId: bigint,
    googleUser: any,
    tokenData: any,
  ) {
    const accessTokenExpiresAt = this.tokenService.calculateTokenExpiration(
      tokenData.expires_in,
    );
    const refreshTokenExpiresAt = tokenData.refresh_token
      ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      : null;

    const now = new Date();

    const existingOAuth = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, 'google'),
      ),
    });

    if (existingOAuth) {
      await this.db
        .update(oauthAccounts)
        .set({
          provider_user_id: googleUser.id,
          provider_email: googleUser.email,
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
        provider_name: 'google',
        provider_user_id: googleUser.id,
        provider_email: googleUser.email,
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
   * トークンを更新
   */
  async refreshToken(userId: bigint): Promise<RefreshTokenResponseDto> {
    try {
      const newTokenData = await this.tokenService.refreshAccessToken(
        userId,
        'google',
      );

      const accessTokenExpiresAt = this.tokenService.calculateTokenExpiration(
        newTokenData.expires_in,
      );
      const now = new Date();

      await this.db
        .update(oauthAccounts)
        .set({
          access_token: newTokenData.access_token,
          access_token_expires_at: accessTokenExpiresAt,
          updated_at: now,
        })
        .where(
          and(
            eq(oauthAccounts.user_id, userId),
            eq(oauthAccounts.provider_name, 'google'),
          ),
        );

      return {
        access_token: newTokenData.access_token,
        expires_in: newTokenData.expires_in,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  /**
   * ログアウト処理
   */
  async logout(userId: bigint): Promise<void> {
    const oauth = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, 'google'),
      ),
    });

    if (oauth && oauth.access_token) {
      await this.tokenService.revokeToken(oauth.access_token);
    }
  }
}
