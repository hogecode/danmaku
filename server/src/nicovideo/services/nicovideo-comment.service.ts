import { Injectable } from '@nestjs/common';
import { NicovideoCommentFetcher } from '../utils/nicovideo-comment.fetcher';
import { CommentsData } from '../types/nicovideo.types';
import { LoggerService } from '../../common/logger/logger.service';

/**
 * ニコ動 コメント取得サービス
 * セッション不要 - thread_keyが取得できれば可能
 */
@Injectable()
export class NicovideoCommentService {
  constructor(
    private readonly commentFetcher: NicovideoCommentFetcher,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 動画コメント取得
   * @param videoId - ビデオID
   */
  async fetchVideoComments(
    videoId: string,
    commentServer: string,
    threadKey: string,
    threads: Array<{ id: string | number; fork: string }>,
    language: string = 'ja-jp',
    commentsFrom?: number,
    commentsLimit?: number,
  ): Promise<CommentsData> {
    try {

      this.logger.debug(`コメント取得開始: ${videoId}`, { videoId });

      const commentsData = await this.commentFetcher.fetchComments(
        videoId,
        commentServer,
        threadKey,
        threads,
        language,
        commentsFrom,
        commentsLimit,
      );

      this.logger.info(
        `コメント取得完了: ${videoId} (${commentsData.globalComments.retrievedCount} 件)`,
        { videoId, retrievedCount: commentsData.globalComments.retrievedCount },
      );

      return commentsData;
    } catch (error) {
      this.logger.error(`コメント取得エラー (${videoId}):`, error as Error);
      throw error;
    }
  }
}
