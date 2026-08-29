/**
 * ログイン開始レスポンスDTO
 */
export class LoginResponseDto {
  authorize_url!: string;
  state!: string;
  expires_in!: number;
}
