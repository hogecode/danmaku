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
   * @param accessToken - プロバイダーのアクセストークン
   * @param folderId - フォルダID（デフォルト: ルート）
   * @param pageToken - ページネーション用トークン
   */
  listFiles(
    accessToken: string,
    folderId?: string,
    pageToken?: string,
  ): Promise<DriveListResponse>;

  /**
   * フォルダ内でキーワード検索
   * @param accessToken - プロバイダーのアクセストークン
   * @param folderId - 検索対象フォルダID
   * @param query - 検索キーワード
   * @param pageToken - ページネーション用トークン
   */
  searchFiles(
    accessToken: string,
    folderId: string,
    query: string,
    pageToken?: string,
  ): Promise<DriveListResponse>;

  /**
   * フォルダを作成（将来用）
   */
  createFolder?(
    accessToken: string,
    name: string,
    parentFolderId?: string,
  ): Promise<FileItemDto>;

  /**
   * ファイルをアップロード（将来用）
   */
  uploadFile?(
    accessToken: string,
    file: Buffer,
    fileName: string,
    parentFolderId?: string,
  ): Promise<FileItemDto>;

  /**
   * ファイルを削除（将来用）
   */
  deleteFile?(accessToken: string, fileId: string): Promise<void>;

  /**
   * ファイルを移動（将来用）
   */
  moveFile?(
    accessToken: string,
    fileId: string,
    newParentFolderId: string,
  ): Promise<FileItemDto>;

  /**
   * ファイルをコピー（将来用）
   */
  copyFile?(
    accessToken: string,
    fileId: string,
    newParentFolderId?: string,
  ): Promise<FileItemDto>;
}
