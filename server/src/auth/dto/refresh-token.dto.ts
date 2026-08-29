/**
 * トークン更新レスポンスDTO
 */
export class RefreshTokenResponseDto {
  access_token!: string;
  expires_in!: number;
}
