/**
 * ドライブ接続開始レスポンスDTO
 * OAuth認可URLを返す
 */
export class DriveConnectionInitiateResponseDto {
  /**
   * OAuth認可URL
   */
  authorize_url!: string;

  /**
   * CSRF対策用ステート
   */
  state!: string;

  /**
   * ステート有効期限（秒）
   */
  expires_in!: number;
}
