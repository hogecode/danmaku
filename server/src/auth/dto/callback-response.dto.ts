/**
 * OAuth コールバックレスポンスDTO
 * Flutter版用のJSON形式レスポンス
 */
export class CallbackResponseDto {
  success!: boolean;
  message?: string;
  userId?: string;
  error?: string;
}
