/**
 * Google トークンレスポンスDTO
 */
export class GoogleTokenDto {
  access_token!: string;
  refresh_token?: string;
  expires_in!: number;
  scope?: string;
  token_type!: string;
  id_token?: string;
  email?: string; // ✅ id_token から抽出されるメールアドレス
}
