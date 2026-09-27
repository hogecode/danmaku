import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

/**
 * Kakolog コメント取得リクエスト DTO
 */
export class GetKakologCommentsRequestDto {
  @IsString({ message: 'チャンネルIDは文字列である必要があります' })
  channelId!: string;

  @IsNumber({}, { message: '開始時刻はUnixタイムスタンプである必要があります' })
  @Min(0)
  startTime!: number;

  @IsNumber({}, { message: '終了時刻はUnixタイムスタンプである必要があります' })
  @Min(0)
  endTime!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
