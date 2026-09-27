import { Injectable } from '@nestjs/common';
import { NicovideoCommentFetcher } from '../utils/nicovideo-comment.fetcher';
import { CommentsData, NicovideoCommentThread } from '../types/nicovideo.types';
import { convertNicovideoCommentsToDPlayer } from '../utils/convert-to-dplayer';
import type { DPlayerCommentDto } from '../dto/download-comment-response.dto';
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

  /**
   * ニコ動コメントを DPlayer 形式に変換
   * 
   * @param commentsData ニコ動形式のコメントデータ
   * @returns DPlayer形式に変換されたコメント
   */
  convertToDPlayerFormat(commentsData: CommentsData): {
    globalComments: CommentsData['globalComments'];
    threads: Array<{
      id: string | number;
      comments: DPlayerCommentDto[];
    }>;
  } {
    try {
      const convertedThreads = commentsData.threads.map((thread: NicovideoCommentThread) => {
        const convertedComments = convertNicovideoCommentsToDPlayer(thread.comments);
        
        this.logger.debug(
          `スレッド ${thread.id} コメント変換: ${thread.comments.length} → ${convertedComments.length}`,
          { threadId: thread.id, originalCount: thread.comments.length, convertedCount: convertedComments.length }
        );

        return {
          id: thread.id,
          comments: convertedComments,
        };
      });

      return {
        globalComments: commentsData.globalComments,
        threads: convertedThreads,
      };
    } catch (error) {
      this.logger.error('DPlayer形式への変換エラー:', error as Error);
      throw error;
    }
  }
}
