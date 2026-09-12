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
 * OneDrive OAuth トークン管理
 */
@Injectable()
export class OnedriveTokenService implements ProviderTokenService {
  private readonly tokenUrl =
    'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private readonly revokeUrl =
    'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  private readonly authUrl =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  private readonly STATE_TTL = 3600; //  1時間に延長

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * OneDrive 認可URL を生成
   */
  async generateAuthorizationUrl(
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

    const stateKey = `oauth:state:onedrive:${state}`;
    const verifierKey = `oauth:verifier:onedrive:${state}`;

    // Redis に state と verifier を保存（有効期限付き）
    await Promise.all([
      this.redis.setex(stateKey, this.STATE_TTL, '1'),
      this.redis.setex(verifierKey, this.STATE_TTL, verifier),
    ]);

    // userId がある場合は Redis に保存
    if (userId) {
      const userIdKey = `oauth:userid:onedrive:${state}`;
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
    });

    return {
      authorize_url: `${this.authUrl}?${params.toString()}`,
      state,
      expires_in: this.STATE_TTL,
    };
  }

  /**
   * OneDrive 認可コードをトークンに交換
   */
  async exchangeCodeForToken(
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
        this.tokenUrl,
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
   * OneDrive リフレッシュトークン
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokenDto> {
    const clientId = this.configService.get<string>('ONEDRIVE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'ONEDRIVE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('OneDrive OAuth configuration missing');
    }

    try {
      const response = await axios.post<GoogleTokenDto>(
        this.tokenUrl,
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
   * OneDrive トークンをリボーク
   */
  async revokeToken(accessToken: string): Promise<void> {
    const clientId = this.configService.get<string>('ONEDRIVE_CLIENT_ID');

    if (!clientId) {
      throw new InternalServerErrorException('OneDrive OAuth configuration missing');
    }

    try {
      await axios.post(
        this.revokeUrl,
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
}
