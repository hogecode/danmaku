import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import axios, { AxiosError } from 'axios';
import { GoogleTokenDto } from '../../../dto';
import { ProviderTokenService } from '../provider-token.interface';
import { PKCEUtil } from '../../../utils/pkce.util';

/**
 * Google OAuth トークン管理
 */
@Injectable()
export class GoogleTokenService implements ProviderTokenService {
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly revokeUrl = 'https://oauth2.googleapis.com/revoke';
  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly STATE_TTL = 3600; // ✅ 10分 → 1時間に延長

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Google 認可URL を生成
   */
  async generateAuthorizationUrl(
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

    const stateKey = `oauth:state:google:${state}`;
    const verifierKey = `oauth:verifier:google:${state}`;

    // Redis に state と verifier を保存（有効期限付き）
    await Promise.all([
      this.redis.setex(stateKey, this.STATE_TTL, '1'),
      this.redis.setex(verifierKey, this.STATE_TTL, verifier),
    ]);

    // userId がある場合は Redis に保存
    if (userId) {
      const userIdKey = `oauth:userid:google:${state}`;
      await this.redis.setex(userIdKey, this.STATE_TTL, String(userId));
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
      authorize_url: `${this.authUrl}?${params.toString()}`,
      state,
      expires_in: this.STATE_TTL,
    };
  }

  /**
   * Google 認可コードをトークンに交換
   */
  async exchangeCodeForToken(
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
        this.tokenUrl,
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
   * Google リフレッシュトークン
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokenDto> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google OAuth configuration missing');
    }

    try {
      const response = await axios.post<GoogleTokenDto>(
        this.tokenUrl,
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
   * Google トークンをリボーク
   */
  async revokeToken(accessToken: string): Promise<void> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new InternalServerErrorException('Google OAuth configuration missing');
    }

    try {
      await axios.post(
        this.revokeUrl,
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
}
