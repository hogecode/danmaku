/**
 * ユーザー情報レスポンスDTO
 */
export class UserInfoDto {
  id!: string;
  email!: string;
  name?: string;
  picture_url?: string | null;
  oauth_provider!: string;
  last_login?: Date | null;
}
