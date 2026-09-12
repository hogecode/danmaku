import { FileItemDto } from '../dto';

/**
 * ファイルリスト結果
 */
export interface DriveListResponse {
  items: FileItemDto[];
  nextPageToken?: string;
}

/**
 * クラウドストレージ プロバイダー インターフェース
 * Google Drive, OneDrive, Dropbox など各プロバイダーが実装
 */
export interface DriveProvider {

  /**
   * フォルダ内のファイル・フォルダを一覧取得
   */
  listFiles(
    accessToken: string,
    folderId?: string,
    pageToken?: string,
  ): Promise<DriveListResponse>;

  /**
   * フォルダ内でキーワード検索
   */
  searchFiles(
    accessToken: string,
    folderId: string,
    query: string,
    pageToken?: string,
  ): Promise<DriveListResponse>;
}
