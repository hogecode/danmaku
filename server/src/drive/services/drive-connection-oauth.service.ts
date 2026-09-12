import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import Redis from 'ioredis';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { LoggerService } from '../../common/logger/logger.service';
import { GoogleTokenService } from '../../auth/services/providers/google/google-token.service';
import { OnedriveTokenService } from '../../auth/services/providers/onedrive/onedrive-token.service';
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
    private encryptionService: EncryptionService,
    private googleTokenService: GoogleTokenService,
    private onedriveTokenService: OnedriveTokenService,
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
      const result = await this.googleTokenService.generateAuthorizationUrl(userId);
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
  ): Promise<{ message: string; connectionId: string }> {
    this.logger.debug(
      `[DriveConnectionOAuthService] Handling Drive connection callback for provider: ${provider}`,
    );

    // Redis から state と verifier を取得（TokenService で保存されている）
    const stateKey = `oauth:state:${provider}:${state}`;
    const verifierKey = `oauth:verifier:${provider}:${state}`;
    const userIdKey = `oauth:userid:${provider}:${state}`;

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
   */
  private async createOrUpdateDriveConnection(
    userId: bigint,
    provider: string,
    tokenResponse: any,
  ): Promise<bigint> {
    const encryptedAccessToken = this.encryptionService.encrypt(tokenResponse.access_token);
    const encryptedRefreshToken = tokenResponse.refresh_token
      ? this.encryptionService.encrypt(tokenResponse.refresh_token)
      : null;

    // 既存レコードをチェック
    const existing = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.user_id, userId),
        eq(driveConnections.provider_name, provider),
      ),
    });

    if (existing) {
      // 更新
      // TODO: drizzle-orm の update メソッドを実装
      this.logger.debug(`[DriveConnectionOAuthService] Updated Drive connection for user: ${userId}`);
      return existing.id;
    }

    // 新規作成
    // TODO: drizzle-orm の insert メソッドを実装
    this.logger.debug(`[DriveConnectionOAuthService] Created new Drive connection for user: ${userId}`);
    
    // 仮のconnectionId返却
    return BigInt(1);
  }

  /**
   * リダイレクトURIを取得
   */
  private getRedirectUri(provider: string): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    return `${baseUrl}/api/drive-connections/${provider}/callback`;
  }
}
