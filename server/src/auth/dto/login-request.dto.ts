import { IsString, IsOptional } from 'class-validator';

/**
 * ログインリクエストDTO
 */
export class LoginRequestDto {
  @IsString()
  @IsOptional()
  redirectUri?: string;
}
