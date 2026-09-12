/**
 * ドライブ接続情報DTO
 */
export class DriveConnectionDto {
  id!: string;
  provider!: string; // 'google', 'onedrive', 'dropbox'
  account!: string; // メールアドレスなど
  status!: 'connected' | 'expired' | 'revoked' | 'error';
  connected_at!: Date;
}

/**
 * ユーザー情報レスポンスDTO
 */
export class UserInfoDto {
  id!: string;
  email!: string;
  name?: string;
  picture_url?: string | null;
  last_login?: Date | null;
  drives!: DriveConnectionDto[];
}
