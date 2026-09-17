import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { LoggerService } from '../../common/logger/logger.service';
import { GoogleTokenService } from '../../auth/services/providers/google/google-token.service';
import { OnedriveTokenService } from '../../auth/services/providers/onedrive/onedrive-token.service';
import { TokenService } from '../../auth/services/token.service';
import { ProviderType } from '../constants';

/**
 * Drive接続用OAuth処理
 * 責務：Drive接続の認可URL生成とcallback処理のみ
 */
@Injectable()
export class DriveConnectionOAuthService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
    private googleTokenService: GoogleTokenService,
    private onedriveTokenService: OnedriveTokenService,
    private tokenService: TokenService,
    private logger: LoggerService,
  ) {}

  /**
   * Drive接続用OAuth認可URLを生成
   */
  async generateDriveAuthorizationUrl(
    userId: bigint,
    provider: string,
  ): Promise<{ authorize_url: string; state: string; expires_in: number }> {
    this.logger.debug(
      `[DriveConnectionOAuthService] Generating Drive auth URL for provider: ${provider}`,
    );

    if (provider === ProviderType.GOOGLE) {
      const result = await this.googleTokenService.generateAuthorizationUrl(userId, 'drive');
      return {
        authorize_url: result.authorize_url,
        state: result.state,
        expires_in: result.expires_in,
      };
    } else if (provider === ProviderType.ONEDRIVE) {
      const result = await this.onedriveTokenService.generateAuthorizationUrl(userId);
      return {
        authorize_url: result.authorize_url,
        state: result.state,
        expires_in: result.expires_in,
      };
    }

    throw new BadRequestException(`Unsupported provider: ${provider}`);
  }

  /**
   * Drive接続用OAuth callback処理
   */
  async handleDriveConnectionCallback(
    provider: string,
    code: string,
    state: string,
    userId: bigint,
  ): Promise<{ message: string; connectionId: string; account?: string }> {
    this.logger.debug(
      `[DriveConnectionOAuthService] Handling Drive connection callback for provider: ${provider}`,
    );

    // Redis から state と verifier を取得（TokenService で保存されている）
    // ⚠️ キー名の形式は provider が小文字の時と TokenService の命名規則に合わせる
    const providerLower = provider.toLowerCase();
    const stateKey = `oauth:state:${providerLower}:${state}`;
    const verifierKey = `oauth:verifier:${providerLower}:${state}`;
    const userIdKey = `oauth:userid:${providerLower}:${state}`;

    const stateExists = await this.redis.get(stateKey);
    if (!stateExists) {
      throw new BadRequestException('Invalid or expired state parameter');
    }

    const verifier = await this.redis.get(verifierKey);
    if (!verifier) {
      throw new BadRequestException('Code verifier not found');
    }

    const storedUserId = await this.redis.get(userIdKey);
    if (!storedUserId || BigInt(storedUserId) !== userId) {
      throw new UnauthorizedException('User ID mismatch or not found in state');
    }

    // state と verifier を削除
    await Promise.all([
      this.redis.del(stateKey),
      this.redis.del(verifierKey),
      this.redis.del(userIdKey),
    ]);

    try {
      const redirectUri = this.getRedirectUri(provider);
      
      if (provider === ProviderType.GOOGLE) {
        const tokenResponse = await this.googleTokenService.exchangeCodeForToken(
          code,
          verifier,
          redirectUri,
        );

        const connectionId = await this.createOrUpdateDriveConnection(
          userId,
          provider,
          tokenResponse,
        );

        return {
          message: 'Drive connection successful',
          connectionId: connectionId.toString(),
          account: tokenResponse.email, // ✅ Google から取得したメールアドレスを返す
        };
      } else if (provider === ProviderType.ONEDRIVE) {
        const tokenResponse = await this.onedriveTokenService.exchangeCodeForToken(
          code,
          verifier,
          redirectUri,
        );

        const connectionId = await this.createOrUpdateDriveConnection(
          userId,
          provider,
          tokenResponse,
        );

        return {
          message: 'Drive connection successful',
          connectionId: connectionId.toString(),
          account: tokenResponse.email, // ✅ OneDrive から取得したメールアドレスを返す
        };
      }

      throw new BadRequestException(`Unsupported provider: ${provider}`);
    } catch (error) {
      this.logger.error('[DriveConnectionOAuthService] Drive connection callback failed', error as Error);
      throw error;
    }
  }

  /**
   * driveConnections レコードを作成/更新
   * 
   * ✅ 複数ドライブアカウント対応
   * - 同じプロバイダーでも異なるアカウント（例：user1@gmail.com, user2@gmail.com）は別レコード
   * - 一意性制約：(user_id, provider_name, provider_account_id)
   */
  private async createOrUpdateDriveConnection(
    userId: bigint,
    provider: string,
    tokenResponse: any,
  ): Promise<bigint> {
    // ✅ トークン有効期限を計算
    const accessTokenExpiresAt = tokenResponse.expires_in
      ? this.tokenService.calculateTokenExpiration(tokenResponse.expires_in)
      : null;
    
    const refreshTokenExpiresAt = tokenResponse.refresh_token
      ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      : null;

    const encryptedAccessToken = this.encryptionService.encrypt(tokenResponse.access_token);
    const encryptedRefreshToken = tokenResponse.refresh_token
      ? this.encryptionService.encrypt(tokenResponse.refresh_token)
      : null;

    // プロバイダー側のアカウント識別子を取得
    // Google: email、OneDrive: email
    const providerAccountId = tokenResponse.email || tokenResponse.id || `${provider}:${Date.now()}`;
    const providerAccountEmail = tokenResponse.email;

    // 既存レコードをチェック（provider_account_id で一意に特定）
    // ✅ 同じプロバイダーでも異なるアカウントは別レコード
    const existing = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.user_id, userId),
        eq(driveConnections.provider_name, provider),
        eq(driveConnections.provider_account_id, providerAccountId),
      ),
    });

    if (existing) {
      // 更新: トークンと last_accessed_at を更新
      this.logger.debug(
        `[DriveConnectionOAuthService] Updating Drive connection (id=${existing.id}, user=${userId}, provider=${provider}, account=${providerAccountEmail})`,
      );

      await this.db
        .update(driveConnections)
        .set({
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken || existing.refresh_token_encrypted,
          access_token_expires_at: accessTokenExpiresAt,
          refresh_token_expires_at: refreshTokenExpiresAt,
          provider_account_email: providerAccountEmail,
          is_active: true,
          last_accessed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(driveConnections.id, existing.id));

      return existing.id;
    }

    // 新規作成（新しいプロバイダーアカウント）
    this.logger.debug(
      `[DriveConnectionOAuthService] Creating new Drive connection (user=${userId}, provider=${provider}, account=${providerAccountEmail})`,
    );

    const result = await this.db.insert(driveConnections).values({
      user_id: userId,
      provider_name: provider,
      provider_account_id: providerAccountId,
      provider_account_email: providerAccountEmail,
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      scopes: JSON.stringify(tokenResponse.scopes || ['drive.readonly']),
      access_token_expires_at: accessTokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      last_accessed_at: new Date(),
    }).returning();

    if (!result || result.length === 0) {
      throw new Error('Failed to create Drive connection');
    }

    this.logger.debug(
      `[DriveConnectionOAuthService] Drive connection created (id=${result[0].id}, provider=${provider}, account=${providerAccountEmail})`,
    );

    return result[0].id;
  }

  /**
   * Drive接続完了後のリダイレクト URL を生成
   * 
   * モバイルクライアント：ディープリンク URL で WebView をクローズし、ホーム画面にジャンプ
   * Web クライアント：フロントエンドの設定画面にリダイレクト
   */
  createDriveConnectionRedirectURL(
    connectionResult: { message: string; connectionId: string; account?: string },
    provider: string,
    clientType: 'mobile' | 'web',
    sessionId: string,
  ): { type: 'deeplink' | 'redirect'; url: string } {
    if (clientType === 'mobile') {
      this.logger.debug(
        `[DriveConnectionOAuthService] Preparing Mobile client response (${provider})`,
      );

      // ✅ ディープリンク URL の形式：danmaku://drive/callback?...
      // ✅ account (email) も含める
      const params = new URLSearchParams({
        sessionId: sessionId,
        provider: provider,
        connectionId: connectionResult.connectionId,
        ...(connectionResult.account && { account: connectionResult.account }),
      });
      const deepLinkUrl = `danmaku://drive/callback?${params.toString()}`;

      this.logger.debug('[DriveConnectionOAuthService] DeepLink generated', {
        sessionId: sessionId.substring(0, 10) + '...',
        provider,
        account: connectionResult.account,
        deepLinkUrl,
      });

      return {
        type: 'deeplink',
        url: deepLinkUrl,
      };
    }

    // Web クライアント
    this.logger.debug(
      `[DriveConnectionOAuthService] Preparing Web client response (${provider})`,
    );
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/settings?tab=drives&status=connected&provider=${provider}&connectionId=${connectionResult.connectionId}`;

    return {
      type: 'redirect',
      url: redirectUrl,
    };
  }

  /**
   * リダイレクトURIを取得
   */
  private getRedirectUri(provider: string): string {
    // provider に対応する環境変数リダイレクト URI を優先的に使用
    const providerUpper = provider.toUpperCase();
    const envRedirectUri = this.configService.get<string>(
      `${providerUpper}_DRIVE_REDIRECT_URI`,
    );
    
    if (envRedirectUri) {
      this.logger.debug(
        `[DriveConnectionOAuthService] Using ${providerUpper}_DRIVE_REDIRECT_URI: ${envRedirectUri}`,
      );
      return envRedirectUri;
    }

    // フォールバック: 動的に構築
    const baseUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
    const redirectUri = `${baseUrl}/api/drive-connections/${provider}/callback`;
    this.logger.debug(
      `[DriveConnectionOAuthService] Using dynamic redirectUri: ${redirectUri}`,
    );
    return redirectUri;
  }
}
