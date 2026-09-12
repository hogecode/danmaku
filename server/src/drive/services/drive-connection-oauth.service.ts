import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import { OAuthStateService } from '../../common/oauth/oauth-state.service';
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
    private oauthStateService: OAuthStateService,
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
      
      // TokenService がすでに state と verifier を Redis に保存するため
      // OAuthStateService での上書きは不要
      // ※ TODO: 後で state 管理を統一する
      
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

    const oauthState = await this.oauthStateService.getAndValidateState(state);
    
    if (oauthState.purpose !== 'drive_connection') {
      throw new BadRequestException(
        `Invalid purpose: expected 'drive_connection', got '${oauthState.purpose}'`,
      );
    }

    if (oauthState.provider !== provider) {
      throw new BadRequestException(`Provider mismatch: ${oauthState.provider} vs ${provider}`);
    }

    if (!oauthState.userId || oauthState.userId !== userId) {
      throw new UnauthorizedException('User ID mismatch or not found in state');
    }

    await this.oauthStateService.deleteState(state);

    try {
      if (provider === ProviderType.GOOGLE) {
        const verifier = oauthState.codeVerifier;
        if (!verifier) {
          throw new BadRequestException('Code verifier not found');
        }
        
        const redirectUri = this.getRedirectUri(provider);
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
        const verifier = oauthState.codeVerifier;
        if (!verifier) {
          throw new BadRequestException('Code verifier not found');
        }
        
        const redirectUri = this.getRedirectUri(provider);
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

    // TODO: drizzle-orm の upsert or insert/update を使用
    // 現在は insert のみサポート
    this.logger.debug(`[DriveConnectionOAuthService] Created/Updated Drive connection for user: ${userId}`);
    
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
