/**
 * OAuth コールバックレスポンスDTO
 * RN/Flutter版用のJSON形式レスポンス
 * 
 * 注意: appToken は自作のアプリケーション認証トークン（JWT）
 * Google OAuth token ではなく、Backend が発行する Token
 */
export class CallbackResponseDto {
  success!: boolean;
  message?: string;
  userId?: string;
  appToken?: string; // Backend 発行の JWT トークン
  error?: string;
}
