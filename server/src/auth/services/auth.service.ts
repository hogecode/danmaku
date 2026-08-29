import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import { users, oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import axios, { AxiosError } from 'axios';
import Redis from 'ioredis';
import { PKCEUtil } from '../utils/pkce.util';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { OAuthAccountService } from './auth-account.service';
import {
  LoginResponseDto,
  GoogleUserInfoDto,
  UserInfoDto,
  RefreshTokenResponseDto,
} from '../dto';

/**
 * Google OAuth 認証サービス
 */
@Injectable()
export class AuthService {
  private readonly googleAuthUrl =
    'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly googleUserInfoUrl =
    'https://openidconnect.googleapis.com/v1/userinfo';
  private readonly STATE_TTL = 600;

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly oauthAccountService: OAuthAccountService,
  ) {}

  /**
   * ログイン開始：OAuth認可URL とstateを生成
   */
  async initializeLogin(): Promise<LoginResponseDto> {
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

    const stateKey = `oauth:state:${state}`;
    const verifierKey = `oauth:verifier:${state}`;

    // Redis に state と verifier を保存（有効期限付き）
    await this.redis.setex(stateKey, this.STATE_TTL, '1');
    await this.redis.setex(verifierKey, this.STATE_TTL, verifier);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code', // 認可コードを要求
      scope: scopes,
      code_challenge: challenge, // PKCE code challenge
      code_challenge_method: 'S256', 
      state,
      access_type: 'offline', // refresh_token を取得するために必要
      prompt: 'consent', // refresh_token を毎回取得するために必要
    });

    const authorize_url = `${this.googleAuthUrl}?${params.toString()}`;

    return {
      authorize_url,
      state,
      expires_in: this.STATE_TTL,
    };
  }

  /**
   * OAuthコールバック処理：コードをトークンに交換
   */
  async handleGoogleCallback(code: string, state: string): Promise<UserInfoDto> {
    const stateKey = `oauth:state:${state}`;
    const stateExists = await this.redis.get(stateKey);

    if (!stateExists) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    const verifierKey = `oauth:verifier:${state}`;
    const verifier = await this.redis.get(verifierKey);

    if (!verifier) {
      throw new BadRequestException('Code verifier not found');
    }

    try {
      await Promise.all([
        this.redis.del(stateKey),
        this.redis.del(verifierKey),
      ]);

      const tokenData = await this.tokenService.exchangeCodeForToken(
        code,
        verifier,
      );

      const googleUser = await this.fetchGoogleUserInfo(
        tokenData.access_token,
      );

      const user = await this.userService.upsertUser(googleUser);

      await this.oauthAccountService.upsertOAuthAccount(
        user.id,
        googleUser,
        tokenData,
      );

      return {
        id: String(user.id),
        email: user.email,
        name: user.name,
        picture_url: user.picture_url,
        oauth_provider: 'google',
        last_login: user.last_login,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('OAuth callback error:', error);
      throw new InternalServerErrorException(
        'Failed to process OAuth callback',
      );
    }
  }

  /**
   * Google ユーザー情報を取得
   */
  private async fetchGoogleUserInfo(
    accessToken: string,
  ): Promise<GoogleUserInfoDto> {
    try {
      // TODO: axiosのインスタンスを作成して、タイムアウトやリトライの設定を追加することを検討
      const response = await axios.get<GoogleUserInfoDto>(
        this.googleUserInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Google userinfo fetch error:', error.response?.data);
        throw new InternalServerErrorException(
          'Failed to fetch Google user info',
        );
      }
      throw error;
    }
  }

}
