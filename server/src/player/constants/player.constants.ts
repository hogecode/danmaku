/**
 * プレイヤー関連定数
 */
export class PlayerConstants {
  // MIME Type定義
  static readonly MIME_TYPES = {
    VIDEO_MP4: 'video/mp4',
    JSON: 'application/json',
    XML: 'text/xml',
  };

  // コメントファイル拡張子
  static readonly EXTENSIONS = {
    COMMENT_JSON: '.json',
    COMMENT_XML: '.xml',
  };

  // Google Drive API 設定
  static readonly API = {
    // files.get() 用：基本フィールド
    BASIC_FIELDS: 'id,name,mimeType,size',
    // files.list() 用：parentId が必要な場合は files(id,name,mimeType,size,parents) を使用
    // ✅ 修正：parents はオブジェクト配列として返されるため、子フィールド指定は不可
    LIST_FIELDS: 'files(id,name,mimeType,size,parents)',
    PAGE_SIZE: 1000,
  };

  // HTTP ステータスコード
  static readonly HTTP_STATUS = {
    OK: 200,
    PARTIAL_CONTENT: 206,
    BAD_REQUEST: 400,
    RANGE_NOT_SATISFIABLE: 416,
  };

  // Range ヘッダー関連
  static readonly RANGE = {
    HEADER_NAME: 'range',
    ACCEPT_RANGES: 'bytes',
  };

  // プライベート コンストラクタでインスタンス化を防ぐ
  private constructor() {}
}
