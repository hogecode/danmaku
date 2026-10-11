import { Injectable } from '@nestjs/common';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * ニコ動ストレージサービス
 * S3 への動画ファイル管理（メタデータ含む）
 */
@Injectable()
export class NicovideoStorageService {
  constructor(
    private readonly s3Storage: S3StorageService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * ダウンロード済みファイルの S3キーを生成
   */
  generateS3KeyForVideo(videoId: string, fileName: string): string {
    return this.s3Storage.buildS3Key(`${videoId}/${fileName}`);
  }

  /**
   * ダウンロード済みコメントの S3キーを生成
   */
  generateS3KeyForComments(videoId: string, fileName: string): string {
    return this.s3Storage.buildS3Key(`${videoId}/comments/${fileName}`);
  }

  /**
   * ファイル情報を取得
   */
  async getFileInfo(s3Key: string): Promise<any> {
    try {
      // S3 メタデータを取得
      this.logger.debug(`ファイル情報取得: ${s3Key}`, { s3Key });
      return { s3Key };
    } catch (error) {
      this.logger.error(`ファイル情報取得失敗: ${s3Key}`, error as Error);
      throw error;
    }
  }
}
