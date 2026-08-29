import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import { oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import axios, { AxiosError } from 'axios';
import { GoogleTokenDto } from '../dto';

/**
 * Google OAuth トークン管理サービス
 */
@Injectable()
export class TokenService {
  private readonly googleTokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly googleRevokeUrl = 'https://oauth2.googleapis.com/revoke';

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 認可コードからアクセストークンを取得
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
  ): Promise<GoogleTokenDto> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Google OAuth configuration missing');
    }

    try {
      const response = await axios.post<GoogleTokenDto>(
        this.googleTokenUrl,
        {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Google token exchange error:', error.response?.data);
        throw new InternalServerErrorException(
          `Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * リフレッシュトークンからアクセストークンを更新
   */
  async refreshAccessToken(
    userId: bigint,
    providerName: string,
  ): Promise<GoogleTokenDto> {
    const oauth = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, providerName),
      ),
    });

    if (!oauth || !oauth.refresh_token) {
      throw new InternalServerErrorException('Refresh token not found');
    }

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google OAuth configuration missing');
    }

    try {
      const response = await axios.post<GoogleTokenDto>(
        this.googleTokenUrl,
        {
          grant_type: 'refresh_token',
          refresh_token: oauth.refresh_token,
          client_id: clientId,
          client_secret: clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Token refresh error:', error.response?.data);
        throw new InternalServerErrorException(
          `Failed to refresh token: ${error.response?.data?.error_description || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * トークンの有効期限を計算
   */
  calculateTokenExpiration(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }

  /**
   * トークンが5分以内に期限切れかチェック
   */
  isTokenExpiringSoon(expiresAt: Date): boolean {
    const fiveMinutesInMs = 5 * 60 * 1000;
    const now = new Date();
    const timeDiff = expiresAt.getTime() - now.getTime();
    return timeDiff < fiveMinutesInMs;
  }

  /**
   * トークンをリボーク（取り消し）
   */
  async revokeToken(accessToken: string): Promise<void> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new InternalServerErrorException('Google OAuth configuration missing');
    }

    try {
      await axios.post(
        this.googleRevokeUrl,
        {
          token: accessToken,
          client_id: clientId,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (error) {
      console.error('Token revoke error:', error);
      // リボーク失敗は無視（既に失効している可能性）
    }
  }
}
