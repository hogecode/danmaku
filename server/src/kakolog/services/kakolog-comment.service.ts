import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../common/logger/logger.service';
import { KakologApiService } from './kakolog-api.service';
import { convertKakologCommentsToDPlayer } from '../utils/convert-to-dplayer';
import type { KakologCommentDto } from '../dto/comment-response.dto';
import type { KakologComment } from '../types/kakolog.types';

/**
 * Kakolog コメント取得・変換サービス
 */
@Injectable()
export class KakologCommentService {
  constructor(
    private readonly apiService: KakologApiService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * チャンネルの時間範囲内のコメントを取得
   *
   * @param channelId チャンネルID
   * @param startTime 開始時刻（Unix timestamp）
   * @param endTime 終了時刻（Unix timestamp）
   * @returns Kakolog形式のコメント配列
   */
  async fetchComments(
    channelId: string,
    startTime: number,
    endTime: number,
  ): Promise<KakologComment[]> {
    try {
      this.logger.debug(`コメント取得開始: ${channelId}`, {
        channelId,
        startTime,
        endTime,
      });

      // APIからコメント取得
      const response = await this.apiService.getComments(
        channelId,
        startTime,
        endTime,
      );

      // 時間範囲でフィルタリング（APIで既にフィルタリングされているが、念のため）
      const filteredComments = response.comments.filter(
        (comment) =>
          comment.date >= startTime && comment.date <= endTime,
      );

      this.logger.info(
        `コメント取得完了: ${channelId} (${filteredComments.length}件)`,
        {
          channelId,
          retrievedCount: filteredComments.length,
          totalCount: response.comments.length,
        },
      );

      return filteredComments;
    } catch (error) {
      this.logger.error(`コメント取得エラー (${channelId}):`, error as Error);
      throw error;
    }
  }

  /**
   * Kakolog コメントを DPlayer 形式に変換
   *
   * @param comments Kakolog形式のコメント配列
   * @param startTime 基準時刻（相対秒数計算用）
   * @returns DPlayer形式のコメント配列
   */
  convertToDPlayerFormat(
    comments: KakologComment[],
    startTime: number,
  ): KakologCommentDto[] {
    try {
      this.logger.debug(`コメント変換開始: ${comments.length}件`, {
        commentCount: comments.length,
      });

      const convertedComments = convertKakologCommentsToDPlayer(
        comments,
        startTime,
      );

      this.logger.info(
        `DPlayer形式への変換完了: ${comments.length} → ${convertedComments.length}`,
        {
          originalCount: comments.length,
          convertedCount: convertedComments.length,
        },
      );

      return convertedComments;
    } catch (error) {
      this.logger.error('DPlayer形式への変換エラー:', error as Error);
      throw error;
    }
  }
}
