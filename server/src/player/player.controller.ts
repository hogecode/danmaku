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
import { CommentListDto } from './dto';
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
   * 動画に対応するコメントを取得
   *
   * コメントファイルの自動検出:
   * - 動画: "aaa.mp4"
   * - コメント: "aaa.xml" または "aaa.json" を自動検索
   * - 見つかった場合: JSON に変換して返す
   * - 見つからない場合: 空配列を返す
   *
   * Response:
   * {
   *   "comments": [
   *     {
   *       "thread": "1492023606",
   *       "no": 19886,
   *       "vpos": 0,
   *       "date": 1492100460,
   *       "mail": "184",
   *       "user_id": "SlF_cF2J1CdotJTaojvbM9mDYAE",
   *       "premium": 1,
   *       "anonymity": 1,
   *       "text": "てか無料期間中に見れば無料やん"
   *     }
   *   ]
   * }
   */
  @Get('comments/:videoFileId')
  @HttpCode(200)
  async getComments(
    @Param('videoFileId') videoFileId: string,
    @Query('folderId') folderId: string,
    @Session() session: Express.Session & { userId?: string },
  ): Promise<CommentListDto> {
    if (!session.userId) {
      throw new BadRequestException('User ID not found in session');
    }

    if (!videoFileId || videoFileId.trim().length === 0) {
      throw new BadRequestException('videoFileId parameter is required');
    }

    const comments = await this.playerService.getCommentsByVideoId(
      BigInt(session.userId),
      videoFileId,
      folderId,
    );

    return {
      comments,
    };
  }
}
