import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Session,
  UseGuards,
  BadRequestException,
  HttpCode,
  Res,
  Headers,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Express } from 'express';
import { PlayerService } from './player.service';
import { TokenService } from '../auth/services/token.service';
import { AuthGuard } from '../auth/guards';
import { DPlayerCommentListDto } from './dto';
import { PlayerConstants } from './constants/player.constants';
import { LoggerService } from '../common/logger/logger.service';

/**
 * プレイヤー Controller
 * 動画ストリーミング、コメント取得、トークン生成エンドポイント
 */
@Controller('api/player')
@UseGuards(AuthGuard)
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly tokenService: TokenService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * 動画ファイルをストリーミング再生
   */
  @Get('stream/:fileId')
  async streamVideo(
    @Param('fileId') fileId: string,
    @Session() session: Express.Session & { userId?: string },
    @Res() res: Response,
    @Headers(PlayerConstants.RANGE.HEADER_NAME) rangeHeader?: string,
  ): Promise<void> {
    try {
      this.logger.info(`🎬 streamVideo called with fileId: ${fileId}`, {
        fileId,
      });

      if (!session.userId) {
        this.logger.error(
          '❌ User ID not found in session',
          new Error('User ID missing'),
        );
        throw new BadRequestException('User ID not found in session');
      }

      if (!fileId || fileId.trim().length === 0) {
        this.logger.error(
          '❌ fileId parameter is required',
          new Error('fileId missing'),
        );
        throw new BadRequestException('fileId parameter is required');
      }

      this.logger.debug(`🔄 Calling playerService.getVideoStreamWithRange...`);
      const streamResponse = await this.playerService.getVideoStreamWithRange(
        BigInt(session.userId),
        fileId,
        rangeHeader,
      );

      this.logger.info(
        `✅ Got stream response with status: ${streamResponse.statusCode}`,
        { statusCode: streamResponse.statusCode },
      );
      this.logger.debug(
        `📊 Content-Length: ${streamResponse.headers.contentLength} bytes`,
        { contentLength: streamResponse.headers.contentLength },
      );

      // ステータスコードを設定
      res.status(streamResponse.statusCode);

      // レスポンスヘッダーを設定
      res.set({
        'Content-Type': streamResponse.headers.contentType,
        'Content-Length': streamResponse.headers.contentLength.toString(),
        'Accept-Ranges': streamResponse.headers.acceptRanges,
        'Cache-Control': 'public, max-age=3600',
      });

      // Content-Range ヘッダーが必要な場合は設定
      if (streamResponse.headers.contentRange) {
        res.set('Content-Range', streamResponse.headers.contentRange);
      }

      this.logger.debug(`📤 Piping stream to response...`);
      // ストリーム送信
      streamResponse.stream.pipe(res);
    } catch (error) {
      this.logger.error(
        `❌ streamVideo error: ${(error as Error).message}`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * DPlayer 互換形式でコメントを取得
   *
   * コメントファイルの自動検出:
   * - 動画: "aaa.mp4"
   * - コメント: "aaa.xml" または "aaa.json" を自動検索
   * - 見つかった場合: DPlayer 互換形式に変換して返す
   * - 見つからない場合: 空配列を返す
   *
   * @example
   * GET /api/player/comments/abc123def456?folderId=folder123
   */
  @Get('comments/:videoFileId')
  @HttpCode(200)
  async getComments(
    @Param('videoFileId') videoFileId: string,
    @Query('folderId') folderId: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<DPlayerCommentListDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    if (!videoFileId || videoFileId.trim().length === 0) {
      throw new BadRequestException('videoFileId parameter is required');
    }

    // ✅ DPlayer 互換形式で取得
    const comments = await this.playerService.getCommentsByVideoIdForDPlayer(
      BigInt(session.userId),
      videoFileId,
      folderId,
    );

    return {
      comments,
    };
  }

  /**
   * POST /api/player/token - 動画ストリーミング用トークン生成
   *
   * 目的: モバイルアプリでの動画URL認証
   * - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成
   * - 有効期限: 15分（デフォルト）
   *
   * @example
   * POST /api/player/token
   * Authorization: Bearer {access_token}
   *
   * Response: { token: "eyJhbGciOiJIUzI1NiIs..." }
   */
  @Post('token')
  @HttpCode(200)
  async generateVideoToken(
    @Session() session: Express.Session,
  ): Promise<{ token: string }> {
    const userId = (session as any).userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in session');
    }

    try {
      this.logger.info(`🎬 Generating video token for userId: ${userId}`);

      // JWT トークンを生成（有効期限: 15分）
      const token = this.tokenService.generateAccessToken(BigInt(userId));

      this.logger.info(`✅ Video token generated (length: ${token.length})`);
      return { token };
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate video token: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
