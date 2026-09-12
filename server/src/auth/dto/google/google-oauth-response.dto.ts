/**
 * Google OAuth コールバックレスポンス型
 * Google から返されるユーザー情報をマッピング
 */
export class GoogleOAuthResponseDto {
  sub!: string;  // Google user ID
  email!: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}
