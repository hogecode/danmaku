import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { KakologCommentService } from './services/kakolog-comment.service';
import { GetKakologCommentsRequestDto, GetKakologCommentsResponseDto } from './dto';
import { LoggerService } from '../common/logger/logger.service';

/**
 * Kakolog (2ch実況ログ) API Controller
 */
@Controller('api/kakolog')
export class KakologController {
  constructor(
    private readonly commentService: KakologCommentService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /api/kakolog/download/comments
   *
   * チャンネルの時間範囲内のコメントを DPlayer 形式で取得
   *
   * @param dto リクエスト（channelId, startTime, endTime）
   * @returns DPlayer形式に変換されたコメント
   */
  @Post('download/comments')
  @HttpCode(200)
  async downloadComments(
    @Body() dto: GetKakologCommentsRequestDto,
  ): Promise<GetKakologCommentsResponseDto> {
    try {
      // バリデーション
      if (!dto.channelId) {
        throw new BadRequestException('channelId 必須');
      }
      if (dto.startTime >= dto.endTime) {
        throw new BadRequestException('startTime は endTime より小さい値である必要があります');
      }

      this.logger.debug(`コメント取得開始: ${dto.channelId}`, {
        channelId: dto.channelId,
        startTime: dto.startTime,
        endTime: dto.endTime,
      });

      // ステップ1: コメント取得
      const comments = await this.commentService.fetchComments(
        dto.channelId,
        dto.startTime,
        dto.endTime,
      );

      this.logger.debug(
        `コメント取得成功: ${comments.length}件`,
        {
          channelId: dto.channelId,
          commentCount: comments.length,
        },
      );

      // ステップ2: DPlayer形式に変換
      const dplayerComments = this.commentService.convertToDPlayerFormat(
        comments,
        dto.startTime,
      );

      this.logger.info(
        `DPlayer形式への変換完了: ${dto.channelId}`,
        {
          channelId: dto.channelId,
          originalCount: comments.length,
          convertedCount: dplayerComments.length,
        },
      );

      // レスポンス構築
      const response: GetKakologCommentsResponseDto = {
        status: 'completed',
        channelId: dto.channelId,
        startTime: dto.startTime,
        endTime: dto.endTime,
        commentCount: comments.length,
        retrievedCount: dplayerComments.length,
        comments: dplayerComments,
      };

      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `コメント取得エラー (${dto.channelId}):`,
        error as Error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        status: 'failed',
        message: `エラー: ${errorMsg}`,
      });
    }
  }
}
