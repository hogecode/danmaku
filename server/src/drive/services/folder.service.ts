import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Database } from '../../database/database.module';
import { oauthAccounts } from '../../database';
import { eq, and } from 'drizzle-orm';
import Redis from 'ioredis';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GDriveConstants } from '../constants/gdrive.constants';
import { FileItemDto, FolderListDto } from '../dto';
import { TokenService } from '../../auth/services';
import { GoogleDriveProvider, OnedriveProvider } from '../providers';
import { ProviderType } from '../constants';

@Injectable()
export class FolderService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly tokenService: TokenService,
    private readonly googleDriveProvider: GoogleDriveProvider,
    private readonly onedriveProvider: OnedriveProvider,
  ) {}

  /**
   * ドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
   * @param userId - ユーザーID
   * @param connectionId - ドライブ接続ID（connectionId指定時は特定接続から取得）
   * @param folderId - フォルダID（デフォルト: 'root'）
   */
  async listFolderContents(
    userId: bigint,
    connectionId?: bigint,
    folderId: string = 'root',
  ): Promise<FolderListDto> {
    const cacheKey = this.getCacheKey(userId, connectionId, folderId, 'list');
    const cachedData = await this.redis.get(cacheKey);
    
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as FolderListDto;
      } catch (err) {
        await this.redis.del(cacheKey);
      }
    }

    // connectionId がない場合は、Google Drive のデフォルト接続を使用（後方互換性）
    if (!connectionId) {
      return this.listFolderContentsLegacy(userId, folderId);
    }

    // 接続情報を取得
    const connection = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.id, connectionId),
        eq(oauthAccounts.user_id, userId),
      ),
    });

    if (!connection) {
      throw new UnauthorizedException('Drive connection not found');
    }

    const accessToken = connection.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('Access token not available');
    }

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

    // キャッシュに保存
    await this.redis.setex(
      cacheKey,
      GDriveConstants.CACHE.TTL_SECONDS,
      JSON.stringify(result),
    );

    return result;
  }

  /**
   * Google Drive フォルダ内容を取得（後方互換性用）
   */
  private async listFolderContentsLegacy(
    userId: bigint,
    folderId: string = 'root',
  ): Promise<FolderListDto> {
    const accessToken = await this.tokenService.getValidAccessToken(userId);

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // サブフォルダと動画のファイルを取得
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and (mimeType='${GDriveConstants.MIME_TYPES.FOLDER}' or mimeType='${GDriveConstants.MIME_TYPES.VIDEO_MP4}')`,
      spaces: 'drive',
      fields: GDriveConstants.API.FIELDS,
      pageSize: GDriveConstants.API.PAGE_SIZE,
    });

    const items = this.mapFilesToDto(response.data.files || []);
    return {
      items,
      nextPageToken: response.data.nextPageToken ?? undefined,
    };
  }

  /**
   * ドライブ接続内でキーワード検索（マルチプロバイダー対応）
   * @param userId - ユーザーID
   * @param connectionId - ドライブ接続ID（connectionId指定時は特定接続から検索）
   * @param folderId - 検索対象フォルダID
   * @param query - 検索キーワード
   */
  async searchInFolder(
    userId: bigint,
    connectionId: bigint | undefined,
    folderId: string,
    query: string,
  ): Promise<FolderListDto> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

    // connectionId がない場合は、Google Drive のデフォルト接続を使用（後方互換性）
    if (!connectionId) {
      return this.searchInFolderLegacy(userId, folderId, query);
    }

    // 接続情報を取得
    const connection = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.id, connectionId),
        eq(oauthAccounts.user_id, userId),
      ),
    });

    if (!connection) {
      throw new UnauthorizedException('Drive connection not found');
    }

    const accessToken = connection.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('Access token not available');
    }

    if (connection.provider_name === ProviderType.GOOGLE) {
      return this.googleDriveProvider.searchFiles(
        accessToken,
        folderId,
        query,
      );
    } else if (connection.provider_name === ProviderType.ONEDRIVE) {
      return this.onedriveProvider.searchFiles(accessToken, folderId, query);
    } else {
      throw new InternalServerErrorException(
        `Unsupported provider: ${connection.provider_name}`,
      );
    }
  }

  /**
   * Google Drive フォルダ内でキーワード検索（後方互換性用）
   */
  private async searchInFolderLegacy(
    userId: bigint,
    folderId: string,
    query: string,
  ): Promise<FolderListDto> {
    const accessToken = await this.tokenService.getValidAccessToken(userId);

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // サブフォルダと動画のファイルを取得
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and fullText contains '${query}' and (mimeType='${GDriveConstants.MIME_TYPES.FOLDER}' or mimeType='${GDriveConstants.MIME_TYPES.VIDEO_MP4}')`,
      spaces: 'drive',
      fields: GDriveConstants.API.FIELDS,
      pageSize: GDriveConstants.API.PAGE_SIZE,
    });

    const items = this.mapFilesToDto(response.data.files || []);
    return { items, nextPageToken: response.data.nextPageToken ?? undefined };
  }

  private mapFilesToDto(files: any[] = []): FileItemDto[] {
    return (files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size ? parseInt(file.size, 10) : undefined,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      thumbnailLink: file.thumbnailLink,
      parentId: file.parents?.[0],
    }));
  }

  private getCacheKey(
    userId: bigint,
    connectionId: bigint | undefined,
    folderId: string,
    op: string,
  ): string {
    const connPart = connectionId ? `conn:${connectionId}` : 'google';
    return `${GDriveConstants.CACHE.KEY_PREFIX}:${userId}:${connPart}:${folderId}:${op}`;
  }
}
