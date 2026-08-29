import { IsString, IsOptional } from 'class-validator';

/**
 * OAuthコールバッククエリDTO
 */
export class CallbackQueryDto {
  @IsString()
  code!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  error_description?: string;
}
