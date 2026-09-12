/**
 * Google Drive API 固有定数
 */
export class GoogleDriveConstants {
  // MIME Type 定義（Google Drive 固有）
  static readonly MIME_TYPES = {
    FOLDER: 'application/vnd.google-apps.folder',
    VIDEO_MP4: 'video/mp4',
  };

  // Google Drive API 設定
  static readonly API = {
    FIELDS:
      'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,size,thumbnailLink,parents)',
    PAGE_SIZE: 1000,
  };

  // プライベートコンストラクタ
  private constructor() {}
}
