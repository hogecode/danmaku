/**
 * Google Drive 関連定数
 */

export class GDriveConstants {
  // MIME Type定義
  static readonly MIME_TYPES = {
    FOLDER: 'application/vnd.google-apps.folder',
    VIDEO_MP4: 'video/mp4',
  };

  // キャッシュ設定
  static readonly CACHE = {
    TTL_SECONDS: 30, // Redis キャッシュ有効期限（秒）
    KEY_PREFIX: 'gdrive', // Redis キー プレフィックス
  };

  // Google Drive API 設定
  static readonly API = {
    FIELDS:
      'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,size,thumbnailLink,parents)',
    PAGE_SIZE: 1000,
  };

  // プライベート コンストラクタでインスタンス化を防ぐ
  private constructor() {}
}
