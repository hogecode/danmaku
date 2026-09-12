import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { DriveProvider, DriveListResponse } from '../drive.provider.interface';
import { FileItemDto } from '../../dto';
import { GoogleDriveConstants } from '../../constants/google/google-drive.constants';

/**
 * Google Drive プロバイダー実装
 */
@Injectable()
export class GoogleDriveProvider implements DriveProvider {
  /**
   * フォルダ内のファイル・フォルダを一覧取得
   * ✅ フォルダと動画ファイルのみを取得
   */
  async listFiles(
    accessToken: string,
    folderId: string = 'root',
    pageToken?: string,
  ): Promise<DriveListResponse> {
    const client = new OAuth2Client();
    client.setCredentials({ access_token: accessToken });

    // ✅ フォルダと動画ファイルのみをフィルタリング
    const filterQuery = GoogleDriveConstants.getFilterQuery();
    const query = `'${folderId}' in parents and trashed=false and (${filterQuery})`;

    const response = await google
      .drive({ version: 'v3', auth: client })
      .files.list({
        q: query,
        spaces: 'drive',
        fields:
          'files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink),nextPageToken',
        pageSize: 50,
        pageToken: pageToken || undefined,
      });

    return {
      items: (response.data.files || []).map((file) => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        size: file.size ? parseInt(file.size, 10) : undefined,
        modifiedTime: file.modifiedTime!,
        webViewLink: file.webViewLink!,
        thumbnailLink: file.thumbnailLink || undefined,
        parentId: folderId,
      })),
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * フォルダ内でキーワード検索
   * ✅ フォルダと動画ファイルのみを取得
   */
  async searchFiles(
    accessToken: string,
    folderId: string,
    query: string,
    pageToken?: string,
  ): Promise<DriveListResponse> {
    const client = new OAuth2Client();
    client.setCredentials({ access_token: accessToken });

    // ✅ フォルダと動画ファイルのみをフィルタリング
    const filterQuery = GoogleDriveConstants.getFilterQuery();
    const q = `'${folderId}' in parents and trashed=false and (${filterQuery}) and (name contains '${query}' or fullText contains '${query}')`;

    const response = await google
      .drive({ version: 'v3', auth: client })
      .files.list({
        q,
        spaces: 'drive',
        fields:
          'files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink),nextPageToken',
        pageSize: 50,
        pageToken: pageToken || undefined,
      });

    return {
      items: (response.data.files || []).map((file) => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        size: file.size ? parseInt(file.size, 10) : undefined,
        modifiedTime: file.modifiedTime!,
        webViewLink: file.webViewLink!,
        thumbnailLink: file.thumbnailLink || undefined,
        parentId: folderId,
      })),
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }
}
