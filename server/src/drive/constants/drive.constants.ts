/**
 * ドライブ API 共通定数
 * （Google Drive / OneDrive / 将来のプロバイダー共通）
 */
export class DriveConstants {
  // キャッシュ設定（全プロバイダー共通）
  static readonly CACHE = {
    TTL_SECONDS: 30, // Redis キャッシュ有効期限（秒）
    KEY_PREFIX: 'drive', // Redis キー プレフィックス（プロバイダー非依存）
  };

  // プライベートコンストラクタでインスタンス化を防ぐ
  private constructor() {}
}
