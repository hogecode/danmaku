import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import Redis from 'ioredis';
import { TokenService } from './token.service';
import { LoggerService } from '../../common/logger/logger.service';
import { LoginResponseDto, UserInfoDto } from '../dto';
import { ProviderType } from '../../drive/constants';
import { GoogleAuthService } from './providers/google/google-auth.service';
import { OnedriveAuthService } from './providers/onedrive/onedrive-auth.service';

/**
 * 認証サービス（マルチプロバイダー対応）
 * 
 * 責務：
 * - プロバイダーのルーティング
 * - クライアント判定
 * - 共通のレスポンス生成
 * 
 * プロバイダー固有の処理は各プロバイダーサービスに委譲
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly onedriveAuthService: OnedriveAuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * プロバイダー別 OAuth コールバック処理
   * 認可コードからアクセストークンを取得し、ユーザー情報を取得してDBに保存する
   */
  async handleProviderCallback(
    provider: string,
    code: string,
    state: string,
  ): Promise<UserInfoDto> {
    this.logger.debug(`[AUTH] Handle callback for provider: ${provider}`);

    // 認可コードからアクセストークンを取得し、ユーザー情報を取得してDBに保存する
    // ✅ state/verifier の検証はプロバイダーサービスで実施
    if (provider === 'google' || provider === ProviderType.GOOGLE) {
      return await this.googleAuthService.handleCallback(code, state);
    } else if (provider === 'onedrive' || provider === ProviderType.ONEDRIVE) {
      return await this.onedriveAuthService.handleCallback(code, state);
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  /**
   * クライアントタイプを検出
   * 
   *  Google OAuth の redirect_uri_mismatch エラーを回避するため、
   * クエリパラメータではなく X-Client-Typeヘッダーで判定
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
   * sessionId をモバイルクライアントに返す
   */
  createRedirectURL(
    userInfo: UserInfoDto,
    provider: string,
    clientType: 'mobile' | 'web',
    sessionId?: string,
  ): { type: 'deeplink' | 'redirect'; url: string; accessToken?: string } {
    if (clientType === 'mobile') {
      this.logger.debug(
        `[AUTH] Preparing Mobile client response (${provider})`,
      );
      const userData = JSON.stringify(userInfo);
      // ✅ sessionId を DeepLink に含める
      const deepLinkUrl = `danmaku://auth/callback?sessionId=${encodeURIComponent(sessionId || '')}&user=${encodeURIComponent(userData)}`;
      this.logger.debug('[AUTH] DeepLink generated with sessionId', {
        sessionId: sessionId?.substring(0, 10) + '...',
      });
      return {
        type: 'deeplink',
        url: deepLinkUrl,
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
