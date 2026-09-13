/**
 * ドライブ接続コールバックレスポンスDTO
 * OAuth認可コード交換後の結果
 */
export class DriveConnectionCallbackResponseDto {
  /**
   * 処理結果メッセージ
   */
  message!: string;

  /**
   * 接続したドライブの接続ID
   */
  connectionId!: string;
}
