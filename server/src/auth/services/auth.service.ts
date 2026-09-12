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
   * state/verifier を検証後、認可コードからアクセストークンを取得し、ユーザー情報を取得してDBに保存する
   */
  async handleProviderCallback(
    provider: string,
    code: string,
    state: string,
  ): Promise<UserInfoDto> {
    this.logger.debug(`[AUTH] Handle callback for provider: ${provider}`);

    // state/verifier を検証
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

    // 認可コードからアクセストークンを取得し、ユーザー情報を取得してDBに保存する
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
   */
  createRedirectURL(
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
