import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

/**
 * コメントダウンロード要求DTO
 */
export class DownloadCommentRequestDto {
  @IsString({ message: '動画IDは文字列である必要があります' })
  videoId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  commentsLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commentsFrom?: number;
}

/**
 * コメントダウンロード応答DTO
 */
export class DownloadCommentResponseDto {
  taskId!: string;
  videoId!: string;
  status!: string;
  message!: string;
  createdAt!: number;
}
