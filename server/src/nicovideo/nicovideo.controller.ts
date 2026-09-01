import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  BadRequestException,
  Res,
  Logger,
} from '@nestjs/common';
import type { Response, Express } from 'express';
import { NicovideVideoService } from './services/nicovideo-video.service';
import { NicovideCommentService } from './services/nicovideo-comment.service';
import {
  DownloadVideoRequestDto,
  DownloadCommentRequestDto,
} from './dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * ニコ動 API Controller
 * セッション不要 - Nicovideo APIはログインなしで公開動画情報取得可能
 */
@Controller('api/nicovideo')
export class NicovideoController {
  private readonly logger = new Logger(NicovideoController.name);

  constructor(
    private readonly videoService: NicovideVideoService,
    private readonly commentService: NicovideCommentService,
  ) {}



  /**
   * POST /api/nicovideo/download/video
   * セッション不要 - Nicovideo APIはログインなしでも公開動画情報取得可能
   */
  @Post('download/video')
  async downloadVideo(
    @Body() downloadDto: DownloadVideoRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    const taskId = uuidv4();

    try {
      if (!downloadDto.videoId) {
        throw new BadRequestException('videoId必須');
      }
      this.logger.log(`動画DL開始: ${downloadDto.videoId} (${taskId})`);

      const metadata = await this.videoService.getVideoMetadata(
        downloadDto.videoId,
      );

      res.json({
        taskId,
        videoId: downloadDto.videoId,
        status: 'completed',
        message: '動画情報取得完了',
        metadata: {
          title: metadata.title,
          duration: metadata.duration,
          uploader: metadata.uploader,
        },
        createdAt: Date.now(),
      });
    } catch (error) {
      this.logger.error(`動画DLエラー (${taskId}):`, error);
      res.status(400).json({
        taskId,
        status: 'failed',
        message: `エラー: ${(error as Error).message}`,
        createdAt: Date.now(),
      });
    }
  }

  /**
   * POST /api/nicovideo/download/comments
   * セッション不要 - thread_keyが取得できれば可能
   * 
   * flow:
   * 1. getVideoMetadata() で HTML から thread_key を抽出
   * 2. thread_key が存在すればコメント取得可能
   * 3. thread_key が不在 = 非公開動画またはコメント機能無効
   */
  @Post('download/comments')
  async downloadComments(
    @Body() downloadDto: DownloadCommentRequestDto,
    @Res() res: Response,
  ): Promise<void> {

    try {
      if (!downloadDto.videoId) {
        throw new BadRequestException('videoId必須');
      }
      const videoId = downloadDto.videoId;

      this.logger.log(`コメント取得開始: ${videoId}`);

      // ステップ1: ビデオメタデータ取得（thread_key も同時に取得）
      const metadata = await this.videoService.getVideoMetadata(videoId);
      console.log(`取得したメタデータ:`, metadata);

      // ステップ2: thread_key の確認
      if (!metadata.threadKey) {
        throw new BadRequestException(
          'コメント取得不可 - 非公開動画またはコメント機能が無効です'
        );
      }

      // ステップ3: コメント取得（thread_key を使用）
      const comments = await this.commentService.fetchVideoComments(
        videoId,
        metadata.commentServer,
        metadata.threadKey,
        metadata.threads,
        metadata.threadParams?.language || 'ja-jp',
      );

      this.logger.log(
        `コメント取得完了: ${videoId} (${comments.globalComments.retrievedCount}/${comments.globalComments.commentCount})`
      );

      res.json({
        videoId,
        status: 'completed',
        message: 'コメント取得完了',
        data: {
          title: metadata.title,
          commentCount: metadata.commentCount,
          retrievedCount: comments.globalComments.retrievedCount,
          threads: comments.threads.length,
        },
        comments
      });
    } catch (error) {
      this.logger.error(`コメント取得エラー (${downloadDto.videoId}):`, error);
      res.status(500).json({
        status: 'failed',
        message: `エラー: ${(error as Error).message}`,
      });
    }
  }
}
