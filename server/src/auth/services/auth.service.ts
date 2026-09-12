import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../../database/database.module';
import type { Request } from 'express';
import { users, oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import axios, { AxiosError } from 'axios';
import Redis from 'ioredis';
import { PKCEUtil } from '../utils/pkce.util';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { OAuthAccountService } from './oauth-account.service';
import { LoggerService } from '../../common/logger/logger.service';
import {
  LoginResponseDto,
  GoogleUserInfoDto,
  UserInfoDto,
  RefreshTokenResponseDto,
} from '../dto';
import { ProviderType } from '../../drive/constants';

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
    private readonly logger: LoggerService,
  ) {}

  /**
   * ログイン開始：プロバイダー別にOAuth認可URL とstateを生成
   */
  async initializeLogin(provider: string = 'google'): Promise<LoginResponseDto> {
    // TokenService を使用して認可URL を生成（state, verifier も自動生成）
    return await this.tokenService.generateAuthorizationUrl(provider);
  }

  /**
   * プロバイダー別 OAuth コールバック処理
   * @param provider - プロバイダー名 ('google', 'onedrive')
   * @param code - OAuth 認可コード
   * @param state - state パラメータ
   */
  async handleProviderCallback(
    provider: string,
    code: string,
    state: string,
  ): Promise<UserInfoDto> {
    // プロバイダーごとの state/verifier キーは provider を含める
    const stateKey = `oauth:state:${provider}:${state}`;
    const verifierKey = `oauth:verifier:${provider}:${state}`;

    const stateExists = await this.redis.get(stateKey);
    if (!stateExists) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    const verifier = await this.redis.get(verifierKey);
    if (!verifier) {
      throw new BadRequestException('Code verifier not found');
    }

    // state と verifier を削除
    await Promise.all([
      this.redis.del(stateKey),
      this.redis.del(verifierKey),
    ]);

    // プロバイダー別の処理を実行
    if (provider === 'google' || provider === ProviderType.GOOGLE) {
      return this.handleGoogleCallback(code, state);
    } else if (provider === 'onedrive' || provider === ProviderType.ONEDRIVE) {
      // TODO: OneDrive コールバック処理を実装
      throw new BadRequestException('OneDrive login not yet implemented');
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  /**
   * OAuthコールバック処理：コードをトークンに交換（Google専用・内部専用）
   * @param code - Google OAuth 認可コード
   * @param state - state パラメータ
   * @internal - handleProviderCallback() から呼ばれることを想定
   */
  private async handleGoogleCallback(code: string, state: string): Promise<UserInfoDto> {
    const verifierKey = `oauth:verifier:google:${state}`;
    const verifier = await this.redis.get(verifierKey);

    if (!verifier) {
      throw new BadRequestException('Code verifier not found');
    }

    try {

      // OAuth認可リクエスト時に使用したリダイレクトURIと同じものを使用
      // ⚠️ initializeLogin と同じく、クエリパラメータなしの baseRedirectUri を使用
      const baseRedirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
      if (!baseRedirectUri) {
        throw new InternalServerErrorException(
          'Google OAuth configuration missing',
        );
      }
      const redirectUri = baseRedirectUri;

      const tokenData = await this.tokenService.exchangeCodeForToken(
        code,
        verifier,
        redirectUri,
        ProviderType.GOOGLE,
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
        name: user.name || undefined,
        picture_url: user.picture_url,
        last_login: user.last_login,
        drives: [], // ドライブ情報は別途 UserService から取得
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

  /**
   * クライアントタイプを検出
   * 
   * ⚠️ IMPORTANT: Google OAuth の redirect_uri_mismatch エラーを回避するため、
   * クエリパラメータではなく Authorization ヘッダー (X-Client-Type) で判定
   * 
   * クライアント判定の優先順位:
   * 1. X-Client-Type ヘッダー (クライアントが明示的に指定した場合)
   * 2. User-Agent ヘッダー (モバイルブラウザの場合)
   * 3. デフォルト: Web クライアント
   */
  detectClientType(request: Request): 'mobile' | 'web' {
    // 1. X-Client-Type ヘッダーをチェック（認証サービスから指定）
    const clientType = request.headers['x-client-type'] as string | undefined;
    if (clientType === 'flutter' || clientType === 'desktop' || clientType === 'mobile') {
      this.logger.debug('[AUTH] Detected Mobile client via X-Client-Type header');
      return 'mobile';
    }

    // 2. User-Agent からモバイルブラウザを検出
    const userAgent = request.headers['user-agent']?.toLowerCase() || '';
    const isMobileUserAgent =
      /mobile|android|iphone|ipad|windows phone|opera mini|blackberry/i.test(userAgent);
    
    if (isMobileUserAgent) {
      this.logger.debug('[AUTH] Detected mobile user agent');
      return 'mobile';
    }

    // 3. デフォルト: Web クライアント
    this.logger.debug('[AUTH] Detected Web client (default)');
    return 'web';
  }

  /**
   * コールバック後のレスポンス情報を準備
   * ディープリンク URL または リダイレクト URL を生成
   */
  prepareCallbackResponse(
    userInfo: UserInfoDto,
    provider: string,
    clientType: 'mobile' | 'web',
  ): { type: 'deeplink' | 'redirect'; url: string; accessToken?: string } {
    if (clientType === 'mobile') {
      this.logger.debug(
        `[AUTH] Preparing Mobile client response (${provider})`,
      );
      const accessToken = this.tokenService.generateAccessToken(
        BigInt(userInfo.id),
      );
      const userData = JSON.stringify(userInfo);
      const deepLinkUrl = `danmaku://auth/callback?user=${encodeURIComponent(userData)}&token=${encodeURIComponent(accessToken)}`;
      this.logger.debug('[AUTH] Access token generated', {
        tokenLength: accessToken.length,
      });
      return {
        type: 'deeplink',
        url: deepLinkUrl,
        accessToken,
      };
    }

    // Web クライアント
    this.logger.debug(
      `[AUTH] Preparing Web client response (${provider})`,
    );
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const redirectUrl = `${frontendUrl}/home`;
    return {
      type: 'redirect',
      url: redirectUrl,
    };
  }

}
