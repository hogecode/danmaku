/**
 * プレイヤー共通定数
 * （Google Drive / OneDrive / 将来のプロバイダー共通）
 */
export class PlayerCommonConstants {
  // MIME Type 定義（全プロバイダー共通）
  static readonly MIME_TYPES = {
    VIDEO_MP4: 'video/mp4',
    JSON: 'application/json',
    XML: 'text/xml',
  };

  // コメントファイル MIME タイプ（複数の可能性に対応）
  static readonly COMMENT_MIME_TYPES = {
    XML: ['text/xml', 'application/xml', 'application/octet-stream'],
    JSON: ['application/json', 'application/octet-stream'],
  };

  // コメントファイル拡張子（全プロバイダー共通）
  static readonly EXTENSIONS = {
    COMMENT_JSON: '.json',
    COMMENT_XML: '.xml',
  };

  // HTTP ステータスコード（全プロバイダー共通）
  static readonly HTTP_STATUS = {
    OK: 200,
    PARTIAL_CONTENT: 206,
    BAD_REQUEST: 400,
    RANGE_NOT_SATISFIABLE: 416,
  };

  // Range ヘッダー関連（全プロバイダー共通）
  static readonly RANGE = {
    HEADER_NAME: 'range',
    ACCEPT_RANGES: 'bytes',
  };

  // プライベートコンストラクタ
  private constructor() {}
}
