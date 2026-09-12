/**
 * Google Drive プレイヤー固有定数
 */
export class PlayerGoogleConstants {
  // Google Drive API 設定
  static readonly API = {
    // files.get() 用：基本フィールド
    BASIC_FIELDS: 'id,name,mimeType,size',
    // files.list() 用
    LIST_FIELDS: 'files(id,name,mimeType,size,parents)',
    PAGE_SIZE: 1000,
  };

  // プライベートコンストラクタ
  private constructor() {}
}
