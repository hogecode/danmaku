import { Injectable, Inject, UnauthorizedException, BadRequestException } from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import { TokenService } from '../../auth/services/token.service';
import type { DriveProvider, DriveListResponse } from '../providers';
import { GoogleDriveProvider, OnedriveProvider } from '../providers';
import { EncryptionService } from '../../common/encryption/encryption.service';

/**
 * Drive Service
 * - プロバイダーの選択（Map パターン）
 * - トークン管理
 * - ファイル操作を統一インターフェースで提供
 * 
 * マルチプロバイダー対応：Google Drive, OneDrive に対応
 */
@Injectable()
export class DriveService {
  private providers: Map<string, DriveProvider> = new Map();

  constructor(
    @Inject('DATABASE_CONNECTION') private db: Database,
    private tokenService: TokenService,
    private googleDriveProvider: GoogleDriveProvider,
    private onedriveProvider: OnedriveProvider,
    private encryptionService: EncryptionService,
  ) {
    // 利用可能なプロバイダーを登録
    this.providers.set('google', googleDriveProvider);
    this.providers.set('onedrive', onedriveProvider);
  }

  /**
   * Connection の認可チェック + Provider 取得
   */
  private async getProviderAndToken(
    userId: bigint,
    connectionId: bigint,
  ): Promise<{ provider: DriveProvider; accessToken: string; providerName: string }> {
    const connection = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.id, connectionId),
        eq(driveConnections.user_id, userId),
        eq(driveConnections.is_active, true),
      ),
    });

    if (!connection) {
      throw new UnauthorizedException('Connection not found or inactive');
    }

    const provider = this.providers.get(connection.provider_name);
    if (!provider) {
      throw new BadRequestException(`Unsupported provider: ${connection.provider_name}`);
    }

    // アクセストークンを取得（リフレッシュ処理含む）
    const accessToken = await this.tokenService.getValidAccessToken(
      userId,
      connection.provider_name,
      connectionId,
    );

    return { provider, accessToken, providerName: connection.provider_name };
  }

  // ========== ファイル操作 API ==========

  async listFiles(userId: bigint, connectionId: bigint, folderId?: string): Promise<DriveListResponse> {
    const { provider, accessToken } = await this.getProviderAndToken(userId, connectionId);
    return provider.listFiles(accessToken, folderId);
  }


}
