import { IsString, IsOptional, IsIn, IsNumber, Min } from 'class-validator';

/**
 * 動画ダウンロード要求DTO
 */
export class DownloadVideoRequestDto {
  @IsString({ message: '動画IDは文字列である必要があります' })
  videoId!: string;

  @IsOptional()
  @IsIn(['high', 'low', 'auto'], { message: 'quality は high, low, auto のいずれかである必要があります' })
  quality?: 'high' | 'low' | 'auto';

  @IsOptional()
  @IsNumber()
  @Min(1)
  commentsLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commentsFrom?: number;

  @IsOptional()
  downloadComments?: boolean;
}

/**
 * 動画ダウンロード応答DTO
 */
export class DownloadVideoResponseDto {
  taskId!: string;
  videoId!: string;
  status!: string;
  message!: string;
  createdAt!: number;
}
