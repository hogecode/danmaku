import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { driveConnections } from '../../database';
import { eq, and } from 'drizzle-orm';
import Redis from 'ioredis';
import {
  DriveConstants,
  GoogleDriveConstants,
  OnedriveDriveConstants,
  ProviderType,
} from '../constants';
import { FileItemDto, FolderListDto } from '../dto';
import { TokenService } from '../../auth/services';
import { GoogleDriveProvider, OnedriveProvider } from '../providers';
import { EncryptionService } from '../../common/encryption/encryption.service';

@Injectable()
export class FolderService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly tokenService: TokenService,
    private readonly googleDriveProvider: GoogleDriveProvider,
    private readonly onedriveProvider: OnedriveProvider,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * ドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
   */
  async listFolderContents(
    userId: bigint,
    connectionId: bigint,
    folderId: string = 'root',
  ): Promise<FolderListDto> {
    // 接続情報を取得
    const connection = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.id, connectionId),
        eq(driveConnections.user_id, userId),
        eq(driveConnections.is_active, true),
      ),
    });

    if (!connection) {
      throw new UnauthorizedException('Drive connection not found or inactive');
    }

    // キャッシュキーを生成（プロバイダー情報を含める）
    const cacheKey = this.getCacheKey(
      userId,
      connectionId,
      folderId,
      'list',
      connection.provider_name,
    );
    const cachedData = await this.redis.get(cacheKey);

    if (cachedData) {
      try {
        return JSON.parse(cachedData) as FolderListDto;
      } catch (err) {
        await this.redis.del(cacheKey);
      }
    }

    // 有効なアクセストークンを取得（自動リフレッシュ対応）
    const accessToken = await this.tokenService.getValidAccessToken(
      userId,
      connection.provider_name,
      connectionId,
    );

    let result: FolderListDto;
    if (connection.provider_name === ProviderType.GOOGLE) {
      result = await this.googleDriveProvider.listFiles(accessToken, folderId);
    } else if (connection.provider_name === ProviderType.ONEDRIVE) {
      result = await this.onedriveProvider.listFiles(accessToken, folderId);
    } else {
      throw new InternalServerErrorException(
        `Unsupported provider: ${connection.provider_name}`,
      );
    }

    // キャッシュに保存（共通定数を使用）
    await this.redis.setex(
      cacheKey,
      DriveConstants.CACHE.TTL_SECONDS,
      JSON.stringify(result),
    );

    return result;
  }

  /**
   * ドライブ接続内でキーワード検索（マルチプロバイダー対応）
   */
  async searchInFolder(
    userId: bigint,
    connectionId: bigint,
    folderId: string,
    query: string,
  ): Promise<FolderListDto> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    // 接続情報を取得
    const connection = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.id, connectionId),
        eq(driveConnections.user_id, userId),
        eq(driveConnections.is_active, true),
      ),
    });

    if (!connection) {
      throw new UnauthorizedException('Drive connection not found or inactive');
    }

    // 有効なアクセストークンを取得（自動リフレッシュ対応）
    const accessToken = await this.tokenService.getValidAccessToken(
      userId,
      connection.provider_name,
      connectionId,
    );
    if (!accessToken) {
      throw new UnauthorizedException('Access token not available');
    }

    if (connection.provider_name === ProviderType.GOOGLE) {
      return this.googleDriveProvider.searchFiles(accessToken, folderId, query);
    } else if (connection.provider_name === ProviderType.ONEDRIVE) {
      return this.onedriveProvider.searchFiles(accessToken, folderId, query);
    } else {
      throw new InternalServerErrorException(
        `Unsupported provider: ${connection.provider_name}`,
      );
    }
  }

  /**
   * キャッシュキーを生成
   * プロバイダー情報を含めることで、プロバイダー別キャッシュを分離
   */
  private getCacheKey(
    userId: bigint,
    connectionId: bigint,
    folderId: string,
    op: string,
    provider: string,
  ): string {
    const connPart = `conn:${connectionId}`;
    return `${DriveConstants.CACHE.KEY_PREFIX}:${provider}:${userId}:${connPart}:${folderId}:${op}`;
  }
}
