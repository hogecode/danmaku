import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

/**
 * ビデオダウンロード開始レスポンス DTO
 */
export class VideoDownloadStartResponseDto {
  @IsString()
  jobId!: string;

  @IsString()
  videoId!: string;

  @IsString()
  status!: 'queued' | 'processing' | 'completed' | 'failed';

  @IsString()
  message!: string;

  @IsOptional()
  @IsNumber()
  estimatedTime?: number;
}

/**
 * ビデオダウンロードステータスレスポンス DTO
 */
export class VideoDownloadStatusResponseDto {
  @IsString()
  jobId!: string;

  @IsString()
  status!: 'queued' | 'processing' | 'completed' | 'failed' | 'not_found';

  @IsString()
  videoId!: string;

  @IsOptional()
  @IsObject()
  progress?: {
    step: string;
    percentage: number;
    message: string;
  };

  @IsOptional()
  @IsObject()
  result?: {
    fileName: string;
    s3Key: string;
    s3Url: string;
    fileSize: number;
    duration: number;
    title: string;
    commentCount?: number;
    completedAt: string;
  };
}

/**
 * ビデオダウンロードキャンセルレスポンス DTO
 */
export class VideoDownloadCancelResponseDto {
  @IsString()
  jobId!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  status?: 'cancelled' | 'not_found';
}
