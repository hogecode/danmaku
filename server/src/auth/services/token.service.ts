import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import type { Database } from '../../database/database.module';
import { oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import axios, { AxiosError } from 'axios';
import { GoogleTokenDto } from '../dto';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { ProviderType } from '../../drive/constants';
import Redis from 'ioredis';
import { PKCEUtil } from '../utils/pkce.util';

/**
 * マルチプロバイダー OAuth トークン管理サービス
 * Google Drive, OneDrive 対応
 */
@Injectable()
export class TokenService {
  private readonly googleTokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly googleRevokeUrl = 'https://oauth2.googleapis.com/revoke';
  
  private readonly onedriveTokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private readonly onedriveRevokeUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';  // revoke も同じエンドポイント

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 認可URL（OAuth authorization URL）を生成
   * @param provider - プロバイダー名（'google' | 'onedrive'）
   * @param userId - ユーザーID（オプション。省略時はログイン用、指定時はドライブ追加用）
   * @returns { authorize_url, state, expires_in }
   */
  async generateAuthorizationUrl(
    provider: string = ProviderType.GOOGLE,
    userId?: bigint,
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    if (provider === ProviderType.GOOGLE) {
      return this.generateGoogleAuthorizationUrl(userId);
    } else if (provider === ProviderType.ONEDRIVE) {
      return this.generateOnedriveAuthorizationUrl(userId);
    }

    throw new InternalServerErrorException(`Unsupported provider: ${provider}`);
  }

  /**
   * Google 認可URL を生成
   */
  private async generateGoogleAuthorizationUrl(
    userId?: bigint,
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    const scopes =
      this.configService.get<string>('GOOGLE_SCOPES') ||
      'openid email profile https://www.googleapis.com/auth/drive.readonly';

    if (!clientId || !redirectUri) {
      throw new InternalServerErrorException(
        'Google OAuth configuration missing',
      );
    }

    const { verifier, challenge } = PKCEUtil.generatePKCE();
    const state = PKCEUtil.generateState();
    const STATE_TTL = 600;

    const stateKey = `oauth:state:google:${state}`;
    const verifierKey = `oauth:verifier:google:${state}`;

    // Redis に state と verifier を保存（有効期限付き）
    await Promise.all([
      this.redis.setex(stateKey, STATE_TTL, '1'),
      this.redis.setex(verifierKey, STATE_TTL, verifier),
    ]);

    // userId がある場合は Redis に保存
    if (userId) {
      const userIdKey = `oauth:userid:google:${state}`;
      await this.redis.setex(userIdKey, STATE_TTL, String(userId));
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      authorize_url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state,
      expires_in: STATE_TTL,
    };
  }

  /**
   * OneDrive 認可URL を生成
   */
  private async generateOnedriveAuthorizationUrl(
    userId?: bigint,
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    const clientId = this.configService.get<string>('ONEDRIVE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('ONEDRIVE_REDIRECT_URI');
    const scopes = 'User.Read Files.Read offline_access';

    if (!clientId || !redirectUri) {
      throw new InternalServerErrorException(
        'OneDrive OAuth configuration missing',
      );
    }

    const { verifier, challenge } = PKCEUtil.generatePKCE();
    const state = PKCEUtil.generateState();
    const STATE_TTL = 600;

    const stateKey = `oauth:state:onedrive:${state}`;
    const verifierKey = `oauth:verifier:onedrive:${state}`;

    // Redis に state と verifier を保存（有効期限付き）
    await Promise.all([
      this.redis.setex(stateKey, STATE_TTL, '1'),
      this.redis.setex(verifierKey, STATE_TTL, verifier),
    ]);

    // userId がある場合は Redis に保存
    if (userId) {
      const userIdKey = `oauth:userid:onedrive:${state}`;
      await this.redis.setex(userIdKey, STATE_TTL, String(userId));
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    });

    return {
      authorize_url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
      state,
      expires_in: STATE_TTL,
    };
  }

  /**
   * 認可コードからアクセストークンを取得
   * @param code - OAuth 認可コード
   * @param codeVerifier - PKCE code verifier
   * @param redirectUri - OAuth認可リクエスト時に使用したリダイレクトURI
   * @param provider - プロバイダー名（'google' | 'onedrive'）
   */
  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
    provider: string = ProviderType.GOOGLE,
  ): Promise<GoogleTokenDto> {
    if (provider === ProviderType.GOOGLE) {
      return this.exchangeGoogleCodeForToken(code, codeVerifier, redirectUri);
    } else if (provider === ProviderType.ONEDRIVE) {
      return this.exchangeOnedriveCodeForToken(code, codeVerifier, redirectUri);
    }

    throw new InternalServerErrorException(`Unsupported provider: ${provider}`);
  }

  /**
   * Google 認可コードをトークンに交換
   */
  private async exchangeGoogleCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<GoogleTokenDto> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );

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
   * OneDrive 認可コードをトークンに交換
   */
  private async exchangeOnedriveCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<GoogleTokenDto> {
    const clientId = this.configService.get<string>('ONEDRIVE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'ONEDRIVE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('OneDrive OAuth configuration missing');
    }

    try {
      const response = await axios.post<GoogleTokenDto>(
        this.onedriveTokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('OneDrive token exchange error:', error.response?.data);
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

    if (providerName === ProviderType.GOOGLE) {
      return this.refreshGoogleAccessToken(oauth.refresh_token);
    } else if (providerName === ProviderType.ONEDRIVE) {
      return this.refreshOnedriveAccessToken(oauth.refresh_token);
    }

    throw new InternalServerErrorException(`Unsupported provider: ${providerName}`);
  }

  /**
   * Google リフレッシュトークン
   */
  private async refreshGoogleAccessToken(refreshToken: string): Promise<GoogleTokenDto> {
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
          refresh_token: refreshToken,
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
        console.error('Google token refresh error:', error.response?.data);
        throw new InternalServerErrorException(
          `Failed to refresh token: ${error.response?.data?.error_description || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * OneDrive リフレッシュトークン
   */
  private async refreshOnedriveAccessToken(refreshToken: string): Promise<GoogleTokenDto> {
    const clientId = this.configService.get<string>('ONEDRIVE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'ONEDRIVE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('OneDrive OAuth configuration missing');
    }

    try {
      const response = await axios.post<GoogleTokenDto>(
        this.onedriveTokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('OneDrive token refresh error:', error.response?.data);
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
  async revokeToken(accessToken: string, provider: string = ProviderType.GOOGLE): Promise<void> {
    if (provider === ProviderType.GOOGLE) {
      return this.revokeGoogleToken(accessToken);
    } else if (provider === ProviderType.ONEDRIVE) {
      return this.revokeOnedriveToken(accessToken);
    }

    console.warn(`Cannot revoke token for unsupported provider: ${provider}`);
  }

  /**
   * Google トークンをリボーク
   */
  private async revokeGoogleToken(accessToken: string): Promise<void> {
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
      console.error('Google token revoke error:', error);
      // リボーク失敗は無視（既に失効している可能性）
    }
  }

  /**
   * OneDrive トークンをリボーク
   */
  private async revokeOnedriveToken(accessToken: string): Promise<void> {
    const clientId = this.configService.get<string>('ONEDRIVE_CLIENT_ID');

    if (!clientId) {
      throw new InternalServerErrorException('OneDrive OAuth configuration missing');
    }

    try {
      await axios.post(
        this.onedriveRevokeUrl,
        new URLSearchParams({
          token: accessToken,
          client_id: clientId,
          token_type_hint: 'access_token',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (error) {
      console.error('OneDrive token revoke error:', error);
      // リボーク失敗は無視（既に失効している可能性）
    }
  }

  /**
   * ユーザーの有効なアクセストークンを取得
   * トークンが期限切れの場合は自動的にリフレッシュして返す
   *
   * @param userId - ユーザーID
   * @param providerName - プロバイダー名（デフォルト: 'google'）
   * @returns 有効なアクセストークン
   * @throws UnauthorizedException - 認証情報が見つからない場合
   */
  async getValidAccessToken(
    userId: bigint,
    providerName: string = 'google',
  ): Promise<string> {
    const oauthAccount = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, providerName),
      ),
    });

    if (!oauthAccount?.access_token) {
      throw new InternalServerErrorException('認証情報が見つかりません');
    }

    // トークンが期限切れまたは5分以内に期限切れの場合はリフレッシュ
    if (
      oauthAccount.access_token_expires_at &&
      this.isTokenExpiringSoon(oauthAccount.access_token_expires_at)
    ) {
      const newToken = await this.refreshAccessToken(userId, providerName);
      return newToken.access_token;
    }

    return oauthAccount.access_token;
  }

  /**
   * アクセストークンを生成（Flutter ディープリンク用）
   * 有効期限: 15分
   */
  generateAccessToken(userId: bigint): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET not configured');
    }

    const payload = {
      sub: String(userId),
      type: 'access',
    };

    const expiresInValue = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
    const expiresIn: StringValue | number = expiresInValue as StringValue | number;
    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, secret, options);
  }
}
