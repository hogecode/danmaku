import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import * as express from 'express';
import { NicovideoVideoService } from './services/nicovideo-video.service';
import { NicovideoCommentService } from './services/nicovideo-comment.service';
import { NicovideoDownloadService } from './services/nicovideo-download.service';
import {
  DownloadVideoRequestDto,
  DownloadCommentRequestDto,
  VideoDownloadStartResponseDto,
  VideoDownloadStatusResponseDto,
  VideoDownloadCancelResponseDto,
} from './dto';
import type {
  DownloadCommentWithDPlayerResponseDto,
  DownloadCommentErrorResponseDto,
} from './dto/download-comment-response.dto';
import { LoggerService } from '../common/logger/logger.service';
import { NicovideoSSEService } from './nicovideo-sse.service';

/**
 * ニコ動 API Controller
 */
@Controller('api/nicovideo')
export class NicovideoController {

  constructor(
    private readonly videoService: NicovideoVideoService,
    private readonly commentService: NicovideoCommentService,
    private readonly downloadService: NicovideoDownloadService,
    private readonly sseService: NicovideoSSEService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * POST /api/nicovideo/download/comments
   * 
   * ニコ動のコメントを取得して DPlayer 形式に変換
   * 
   * 1. getVideoMetadata() で HTML から thread_key を抽出
   * 2. thread_key が存在すればコメント取得可能
   * 3. thread_key が不在 = 非公開動画またはコメント機能無効
   * 4. ニコ動形式のコメント → DPlayer形式に変換
   * 
   * @param downloadDto - ダウンロードリクエスト（videoId必須）
   * @returns DPlayer形式に変換されたコメント
   */
  @Post('download/comments')
  async downloadComments(
    @Body() downloadDto: DownloadCommentRequestDto,
  ): Promise<DownloadCommentWithDPlayerResponseDto> {
    try {
      if (!downloadDto.videoId) {
        throw new BadRequestException('videoId必須');
      }
      const videoId = downloadDto.videoId;

      this.logger.debug(`コメント取得開始: ${videoId}`, { videoId });

      // ステップ1: ビデオメタデータ取得（thread_key も同時に取得）
      const metadata = await this.videoService.getVideoMetadata(videoId);

      // ステップ2: thread_key の確認
      this.logger.debug(`メタデータ取得成功`, {
        title: metadata.title,
        threadKey: metadata.threadKey,
        commentServer: metadata.commentServer,
        threads: metadata.threads?.length,
      });

      if (!metadata.threadKey) {
        throw new BadRequestException(
          'コメント取得不可 - 非公開動画またはコメント機能が無効です',
        );
      }

      // ステップ3: コメント取得（thread_key を使用）
      const nicoComments = await this.commentService.fetchVideoComments(
        videoId,
        metadata.commentServer,
        metadata.threadKey,
        metadata.threads,
        metadata.threadParams?.language || 'ja-jp',
      );

      this.logger.info(
        `コメント取得完了: ${videoId} (${nicoComments.globalComments.retrievedCount}/${nicoComments.globalComments.commentCount})`,
        {
          videoId,
          retrievedCount: nicoComments.globalComments.retrievedCount,
          totalCount: nicoComments.globalComments.commentCount,
        },
      );

      // ステップ4: ニコ動形式 → DPlayer形式に変換
      const dplayerComments = this.commentService.convertToDPlayerFormat(nicoComments);

      this.logger.debug(`DPlayer形式への変換完了`, {
        videoId,
        threadCount: dplayerComments.threads.length,
        totalComments: dplayerComments.threads.reduce((sum, t) => sum + t.comments.length, 0),
      });

      this.logger.info(
        `DPlayer形式への変換完了: ${videoId}`,
        {
          videoId,
          threadCount: dplayerComments.threads.length,
        },
      );

      const response: DownloadCommentWithDPlayerResponseDto = {
        videoId,
        status: 'completed',
        message: 'コメント取得完了',
        data: {
          title: metadata.title,
          commentCount: metadata.commentCount,
          retrievedCount: nicoComments.globalComments.retrievedCount,
          threads: dplayerComments.threads.length,
        },
        comments: dplayerComments,
      };

      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      this.logger.error(
        `コメント取得エラー (${downloadDto.videoId}):`,
        error as Error,
      );

      const errorResponse: DownloadCommentErrorResponseDto = {
        status: 'failed',
        message: `エラー: ${errorMsg}`,
      };

      throw new BadRequestException(errorResponse);
    }
  }

  /**
   * POST /api/nicovideo/download/video
   *
   * 非同期で動画ダウンロードを開始
   * ジョブIDを即座に返す
   */
  @Post('download/video')
  async startVideoDownload(
    @Body() downloadDto: DownloadVideoRequestDto,
  ): Promise<VideoDownloadStartResponseDto> {
    try {
      if (!downloadDto.videoId) {
        throw new BadRequestException('videoId is required');
      }

      const quality = downloadDto.quality || 'auto';
      const downloadComments = downloadDto.downloadComments || false;

      const result = await this.downloadService.startDownload(
        downloadDto.videoId,
        quality as any,
        downloadComments,
      );

      this.logger.info(
        `ダウンロード開始: ${downloadDto.videoId} (Job ID: ${result.jobId})`,
        { videoId: downloadDto.videoId, jobId: result.jobId },
      );

      return {
        jobId: result.jobId,
        videoId: downloadDto.videoId,
        status: 'queued',
        message: result.message,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `ダウンロード開始失敗: ${downloadDto.videoId}`,
        error as Error,
      );
      throw new BadRequestException(errorMsg);
    }
  }

  /**
   * GET /api/nicovideo/download/status/:jobId
   *
   * ダウンロードジョブのステータスを確認
   */
  @Get('download/status/:jobId')
  async getDownloadStatus(
    @Param('jobId') jobId: string,
  ): Promise<VideoDownloadStatusResponseDto> {
    try {
      const status = await this.downloadService.getJobStatus(jobId);

      return {
        jobId,
        status: status.status,
        videoId: status.videoId || '',
        progress: status.progress,
        result: status.result,
      };
    } catch (error) {
      this.logger.error(`ジョブ状態確認失敗: ${jobId}`, error as Error);
      throw new BadRequestException('ジョブ状態確認失敗');
    }
  }

  /**
   * GET /api/nicovideo/download/progress/:jobId/sse
   *
   * Server-Sent Events で進捗をリアルタイム配信
   */
  @Get('download/progress/:jobId/sse')
  async getDownloadProgress(
    @Param('jobId') jobId: string,
    @Res() res: express.Response,
  ): Promise<void> {
    try {
      this.logger.debug(`SSE接続開始: ${jobId}`, { jobId });
      // SSE接続を登録
      await this.sseService.registerClient(jobId, res);
    } catch (error) {
      this.logger.error(`SSE接続失敗: ${jobId}`, error as Error);
      res.status(500).json({ error: 'SSE接続失敗' });
    }
  }

  /**
   * DELETE /api/nicovideo/download/:jobId
   *
   * ダウンロードジョブをキャンセル
   */
  @Delete('download/:jobId')
  async cancelDownload(
    @Param('jobId') jobId: string,
  ): Promise<VideoDownloadCancelResponseDto> {
    try {
      // ダウンロードジョブをキャンセル
      const cancelled = await this.downloadService.cancelJob(jobId);

      return {
        jobId,
        message: cancelled ? 'ダウンロードをキャンセルしました' : 'ジョブが見つかりません',
        status: cancelled ? 'cancelled' : 'not_found',
      };
    } catch (error) {
      this.logger.error(`ジョブキャンセル失敗: ${jobId}`, error as Error);
      throw new BadRequestException('ジョブキャンセル失敗');
    }
  }
}
