/**
 * Google Drive ファイル/フォルダ情報 DTO
 */
export class FileItemDto {
  /**
   * ファイル/フォルダID
   */
  id!: string;

  /**
   * ファイル/フォルダ名
   */
  name!: string;

  /**
   * MIME タイプ
   * - 'application/vnd.google-apps.folder' = フォルダ
   * - 'video/mp4' = MP4 ビデオ
   */
  mimeType!: string;

  /**
   * ファイル/フォルダサイズ（バイト）
   * フォルダの場合は null
   */
  size?: number;

  /**
   * 最終更新日時（ISO 8601形式）
   */
  modifiedTime: string;

  /**
   * Google Drive WebView URL
   */
  webViewLink: string;

  /**
   * サムネイル URL（ビデオファイルの場合のみ）
   */
  thumbnailLink?: string;

  /**
   * 親フォルダID
   */
  parentId?: string;
}
