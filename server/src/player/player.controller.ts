import {
  Controller,
  Get,
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
import { PlayerService } from './player.service';
import { AuthGuard } from '../auth/guards';
import { DPlayerCommentListDto } from './dto';
import { Express } from 'express';
import { PlayerConstants } from './constants/player.constants';

/**
 * プレイヤー Controller
 * 動画ストリーミング とコメント取得エンドポイント
 */
@Controller('api/player')
@UseGuards(AuthGuard)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  /**
   * GET /api/player/stream/:fileId
   * 動画ファイルをストリーミング再生
   *
   * Range リクエスト対応:
   * - Range: bytes=0-1023 （最初の1KBのみ取得）
   * - Range: bytes=1024- （1KBから最後まで取得）
   * - Range: bytes=-512 （最後の512バイトを取得）
   *
   * レスポンス:
   * - Range ヘッダーなし: HTTP 200 + Content-Length
   * - Range ヘッダーあり（有効）: HTTP 206 + Content-Range
   * - Range ヘッダーあり（無効）: HTTP 400 Bad Request
   *
   * @param fileId - GDrive ファイルID
   * @param session - ユーザーセッション
   * @param res - Response オブジェクト
   * @param rangeHeader - Range ヘッダー（オプション）
   * @returns 動画ストリーム（MP4バイナリ）
   *
   * @example
   * GET /api/player/stream/abc123def456
   * GET /api/player/stream/abc123def456 -H "Range: bytes=0-1048575"
   */
  @Get('stream/:fileId')
  async streamVideo(
    @Param('fileId') fileId: string,
    @Session() session: Express.Session & { userId?: string },
    @Res() res: Response,
    @Headers(PlayerConstants.RANGE.HEADER_NAME) rangeHeader?: string,
  ): Promise<void> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    if (!fileId || fileId.trim().length === 0) {
      throw new BadRequestException('fileId parameter is required');
    }

    const streamResponse = await this.playerService.getVideoStreamWithRange(
      BigInt(session.userId),
      fileId,
      rangeHeader,
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

    // ストリーム送信
    streamResponse.stream.pipe(res);
  }

  /**
   * GET /api/player/comments/:videoFileId
   * DPlayer 互換形式でコメントを取得
   *
   * コメントファイルの自動検出:
   * - 動画: "aaa.mp4"
   * - コメント: "aaa.xml" または "aaa.json" を自動検索
   * - 見つかった場合: DPlayer 互換形式に変換して返す
   * - 見つからない場合: 空配列を返す
   *
   * Query Parameters:
   * - folderId (required): 動画ファイルが存在するフォルダID
   *
   * Response (DPlayer 互換形式):
   * {
   *   "comments": [
   *     {
   *       "time": 10.5,
   *       "type": "normal",
   *       "size": "normal",
   *       "color": "#ffffff",
   *       "author": "SlF_cF2J1CdotJTaojvbM9mDYAE or null",
   *       "text": "てか無料期間中に見れば無料やん"
   *     }
   *   ]
   * }
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
}
