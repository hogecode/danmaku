import {
  Injectable,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import type { Database } from '../database/database.module';
import Redis from 'ioredis';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GDriveConstants } from './constants/gdrive.constants';
import { FileItemDto, FolderListDto } from './dto';
import { TokenService } from '../auth/services';

@Injectable()
export class GDriveService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Google Drive フォルダ内容を取得
   */
  async listFolderContents(
    userId: bigint,
    folderId: string = 'root',
  ): Promise<FolderListDto> {
    const cacheKey = this.getCacheKey(userId, folderId, 'list');
    const cachedData = await this.redis.get(cacheKey);
    
    if (cachedData) {
      try {
        return JSON.parse(cachedData) as FolderListDto;
      } catch (err) {
        await this.redis.del(cacheKey);
      }
    }

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
    const result: FolderListDto = {
      items,
      nextPageToken: response.data.nextPageToken ?? undefined,
    };

    // キャッシュに保存
    await this.redis.setex(
      cacheKey,
      GDriveConstants.CACHE.TTL_SECONDS,
      JSON.stringify(result),
    );

    return result;
  }

  /**
   * Google Drive フォルダ内でキーワード検索
   */
  async searchInFolder(
    userId: bigint,
    folderId: string,
    query: string,
  ): Promise<FolderListDto> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query cannot be empty');
    }

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

  private getCacheKey(userId: bigint, folderId: string, op: string): string {
    return `${GDriveConstants.CACHE.KEY_PREFIX}:${userId}:${folderId}:${op}`;
  }
}
