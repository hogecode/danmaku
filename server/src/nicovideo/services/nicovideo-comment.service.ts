import { Injectable, Logger } from '@nestjs/common';
import { NicovideoCommentFetcher } from '../utils/nicovideo-comment.fetcher';
import { CommentsData } from '../types/nicovideo.types';

/**
 * ニコ動 コメント取得サービス
 * セッション不要 - thread_keyが取得できれば可能
 */
@Injectable()
export class NicovideoCommentService {
  private readonly logger = new Logger(NicovideoCommentService.name);

  constructor(
    private readonly commentFetcher: NicovideoCommentFetcher,
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

      this.logger.log(`コメント取得開始: ${videoId}`);

      const commentsData = await this.commentFetcher.fetchComments(
        videoId,
        commentServer,
        threadKey,
        threads,
        language,
        commentsFrom,
        commentsLimit,
      );

      this.logger.log(
        `コメント取得完了: ${videoId} (${commentsData.globalComments.retrievedCount} 件)`,
      );

      return commentsData;
    } catch (error) {
      this.logger.error(`コメント取得エラー (${videoId}):`, error);
      throw error;
    }
  }
}
