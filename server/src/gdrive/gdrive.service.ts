import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Database } from '../database/database.module';
import { oauthAccounts } from '../database';
import { eq, and } from 'drizzle-orm';
import Redis from 'ioredis';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import axios, { AxiosError } from 'axios';
import { GDRIVE_CONSTANTS } from './constants/gdrive.constants';
import { FileItemDto, FolderListDto } from './dto';

@Injectable()
export class GDriveService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
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

    const accessToken = await this.getAccessToken(userId);
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and (mimeType='${GDRIVE_CONSTANTS.MIME_TYPES.FOLDER}' or mimeType='${GDRIVE_CONSTANTS.MIME_TYPES.VIDEO_MP4}')`,
      spaces: 'drive',
      fields: GDRIVE_CONSTANTS.API.FIELDS,
      pageSize: GDRIVE_CONSTANTS.API.PAGE_SIZE,
    });

    const items = this.mapFilesToDto(response.data.files || []);
    const result: FolderListDto = {
      items,
      nextPageToken: response.data.nextPageToken ?? undefined,
    };

    await this.redis.setex(
      cacheKey,
      GDRIVE_CONSTANTS.CACHE.TTL_SECONDS,
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

    const accessToken = await this.getAccessToken(userId);
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and fullText contains '${query}' and (mimeType='${GDRIVE_CONSTANTS.MIME_TYPES.FOLDER}' or mimeType='${GDRIVE_CONSTANTS.MIME_TYPES.VIDEO_MP4}')`,
      spaces: 'drive',
      fields: GDRIVE_CONSTANTS.API.FIELDS,
      pageSize: GDRIVE_CONSTANTS.API.PAGE_SIZE,
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

  /**
   * ユーザーのアクセストークンを取得
   * アクセストークンが期限切れの場合はリフレッシュトークンを使用して更新
   */
  private async getAccessToken(userId: bigint): Promise<string> {
    const oauthAccount = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.user_id, userId),
        eq(oauthAccounts.provider_name, 'google'),
      ),
    });

    if (!oauthAccount?.access_token) {
      throw new UnauthorizedException(
        "認証情報が見つかりません",
      );
    }

    if (
      oauthAccount.access_token_expires_at &&
      oauthAccount.access_token_expires_at < new Date()
    ) {
      return this.refreshAccessToken(userId, oauthAccount.refresh_token);
    }

    return oauthAccount.access_token;
  }

  private async refreshAccessToken(
    userId: bigint,
    refreshToken: string | null,
  ): Promise<string> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required.');
    }

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
    );

    const newAccessToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    const accessTokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await this.db
      .update(oauthAccounts)
      .set({
        access_token: newAccessToken,
        access_token_expires_at: accessTokenExpiresAt,
      })
      .where(
        and(
          eq(oauthAccounts.user_id, userId),
          eq(oauthAccounts.provider_name, 'google'),
        ),
      );

    return newAccessToken;
  }

  private getCacheKey(userId: bigint, folderId: string, op: string): string {
    return `${GDRIVE_CONSTANTS.CACHE.KEY_PREFIX}:${userId}:${folderId}:${op}`;
  }
}
