/**
 * Google ユーザー情報DTODTO
 */
export class GoogleUserInfoDto {
  id!: string;
  email!: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  locale?: string;
}
