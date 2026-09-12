import { ApiProperty } from '@nestjs/swagger';

/**
 * 動画ストリーミング用トークン生成レスポンスDTO
 */
export class GenerateVideoTokenResponseDto {
  token!: string;
}
