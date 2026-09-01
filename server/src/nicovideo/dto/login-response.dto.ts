/**
 * ニコ動ログイン応答DTO
 */
export class NicovideLoginResponseDto {
  success: boolean;
  message: string;
  email?: string;
  createdAt?: number;
}
