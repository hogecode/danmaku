import { Injectable, NotImplementedException } from '@nestjs/common';
import { DriveProvider, DriveListResponse } from './drive.provider.interface';

/**
 * OneDrive プロバイダー実装
 * 
 * 注: 現在は listFiles と searchFiles のみ実装
 * ClientID/Secret の設定後、Microsoft Graph API との統合予定
 */
@Injectable()
export class OnedriveProvider implements DriveProvider {
  /**
   * フォルダ内のファイル・フォルダを一覧取得
   * 
   * Microsoft Graph API:
   * GET /me/drive/items/{id}/children
   */
  async listFiles(
    accessToken: string,
    folderId: string = 'root',
    pageToken?: string,
  ): Promise<DriveListResponse> {
    // TODO: OneDrive API 実装
    throw new NotImplementedException(
      'OneDrive listFiles is not yet implemented. Configure ONEDRIVE_CLIENT_ID and ONEDRIVE_CLIENT_SECRET in .env',
    );
  }

  /**
   * フォルダ内でキーワード検索
   * 
   * Microsoft Graph API:
   * POST /me/drive/root/microsoft.graph.search
   */
  async searchFiles(
    accessToken: string,
    folderId: string,
    query: string,
    pageToken?: string,
  ): Promise<DriveListResponse> {
    // TODO: OneDrive API 実装
    throw new NotImplementedException(
      'OneDrive searchFiles is not yet implemented. Configure ONEDRIVE_CLIENT_ID and ONEDRIVE_CLIENT_SECRET in .env',
    );
  }
}
