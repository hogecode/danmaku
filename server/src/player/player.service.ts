import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { Database } from '../database/database.module';
import { CommentDto, DPlayerCommentDto } from './dto';
import { XmlParser } from './utils/xml-parser';
import { CommentConverter } from './utils/comment-converter';
import { PlayerConstants } from './constants/player.constants';
import { TokenService } from '../auth/services';
import { GDriveService } from '../gdrive/gdrive.service';

interface FileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  parentId?: string;
}

interface RangeInfo {
  start: number;
  end: number;
  size: number;
}

interface StreamResponse {
  stream: NodeJS.ReadableStream;
  statusCode: number;
  headers: {
    contentType: string;
    contentLength: number;
    contentRange?: string;
    acceptRanges: string;
  };
}

/**
 * プレイヤー Service
 * 動画ストリーミング とコメント取得を管理
 */
@Injectable()
export class PlayerService {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly xmlParser: XmlParser,
    private readonly commentConverter: CommentConverter,
    private readonly tokenService: TokenService,
    private readonly gdriveService: GDriveService,
  ) {}

  /**
   * 動画ファイルをストリーミング取得
   * @returns ストリーム情報（ファイルサイズ、MIME タイプ）
   */
  async getVideoStream(
    userId: bigint,
    videoFileId: string,
  ): Promise<NodeJS.ReadableStream> {
    const accessToken = await this.tokenService.getValidAccessToken(userId);
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // ファイルメタデータを取得
    const fileMetadata = await drive.files.get({
      fileId: videoFileId,
      fields: 'id,name,mimeType,size',
    });

    // MIME タイプが MP4 であることを確認
    if (fileMetadata.data.mimeType !== PlayerConstants.MIME_TYPES.VIDEO_MP4) {
      throw new BadRequestException(
        `Invalid file type: ${fileMetadata.data.mimeType}. Only MP4 videos are supported.`,
      );
    }

    // Google Drive API からファイルをダウンロード
    const response = await drive.files.get(
      {
        fileId: videoFileId,
        alt: 'media',
      },
      { responseType: 'stream' },
    );

    return response.data;
  }

  /**
   * 動画ファイルのメタデータを取得
   * @param userId - ユーザーID
   * @param videoFileId - 動画ファイルID
   * @returns ファイル情報
   */
  async getVideoMetadata(userId: bigint, videoFileId: string): Promise<FileInfo> {
    const accessToken = await this.tokenService.getValidAccessToken(userId);
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // files.get() で動画ファイルの基本情報を取得
    const fileResponse = await drive.files.get({
      fileId: videoFileId,
      fields: 'id,name,mimeType,size',
      supportsAllDrives: true,
    });

    if (!fileResponse.data.id) {
      throw new NotFoundException(`Video file not found: ${videoFileId}`);
    }

    return {
      id: fileResponse.data.id,
      name: fileResponse.data.name || '',
      mimeType: fileResponse.data.mimeType || '',
      size: fileResponse.data.size
        ? parseInt(fileResponse.data.size as string, 10)
        : undefined,
      parentId: undefined, // フロント側で folderId を管理
    };
  }

  /**
   * 動画に対応するコメントを取得（CommentDto 形式）
   * @param userId - ユーザーID
   * @param videoFileId - 動画ファイルID
   * @param folderId - 動画ファイルが存在するフォルダID（フロント側から指定）
   * @returns ニコニコ実況形式コメント配列（JSON）
   */
  async getCommentsByVideoId(
    userId: bigint,
    videoFileId: string,
    folderId: string,
  ): Promise<CommentDto[]> {
    try {
      console.log(
        `[PlayerService] Getting comments for videoFileId: ${videoFileId}, folderId: ${folderId}`,
      );

      // 1. 動画ファイル情報を取得
      const videoFile = await this.getVideoMetadata(userId, videoFileId);
      console.log(`[PlayerService] Retrieved video metadata: name=${videoFile.name}`);

      // 2. 対応するコメントファイルを検索
      const commentFile = await this.findCommentFile(userId, folderId, videoFile.name);

      if (!commentFile) {
        // コメント無し
        console.log(
          `[PlayerService] No comment file found for video: ${videoFile.name}`,
        );
        return [];
      }

      // 3. ファイルをダウンロード・パース
      const fileContent = await this.downloadFileContent(userId, commentFile.id);
      const comments = await this.xmlParser.parseCommentFile(
        fileContent,
        commentFile.mimeType,
      );

      console.log(
        `[PlayerService] Successfully loaded ${comments.length} comments for video: ${videoFile.name}`,
      );
      return comments;
    } catch (error) {
      // エラー時はログして空配列を返す（動画再生は継続）
      console.error('[PlayerService] Failed to get comments:', {
        error: error instanceof Error ? error.message : String(error),
        videoFileId,
      });
      return [];
    }
  }

  /**
   * 動画に対応するコメントを取得（DPlayer 互換形式）
   * @param userId - ユーザーID
   * @param videoFileId - 動画ファイルID
   * @param folderId - 動画ファイルが存在するフォルダID
   * @returns DPlayer 互換コメント配列
   */
  async getCommentsByVideoIdForDPlayer(
    userId: bigint,
    videoFileId: string,
    folderId: string,
  ): Promise<DPlayerCommentDto[]> {
    try {
      // ✅ CommentDto 形式でコメントを取得
      const comments = await this.getCommentsByVideoId(userId, videoFileId, folderId);

      // ✅ DPlayer 互換形式に変換
      const dplayerComments = this.commentConverter.convertCommentsToDPlayer(comments);

      console.log(
        `[PlayerService] Converted ${dplayerComments.length} comments to DPlayer format`,
      );
      return dplayerComments;
    } catch (error) {
      console.error('[PlayerService] Failed to get comments for DPlayer:', {
        error: error instanceof Error ? error.message : String(error),
        videoFileId,
      });
      return [];
    }
  }

  /**
   * 親フォルダからコメントファイルを検索
   * @returns コメントファイル情報 または null
   */
  private async findCommentFile(
    userId: bigint,
    folderId: string,
    videoFileName: string,
  ): Promise<FileInfo | null> {
    try {

      // ファイル名から拡張子を除去（"aaa.mp4" → "aaa"）
      const baseFileName = videoFileName.replace(/\.[^/.]+$/, '');

      const accessToken = await this.tokenService.getValidAccessToken(userId);

      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      console.log(
        `[PlayerService] Searching for comment file for video: ${videoFileName} in folder: ${folderId}`,
      );

      // ✅ フォルダ内のすべてのファイルを取得
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: PlayerConstants.API.LIST_FIELDS,
        pageSize: PlayerConstants.API.PAGE_SIZE,
        supportsAllDrives: true,
      });

      /*console.log(
        `[PlayerService] Found ${response.data.files?.length || 0} files in folder: ${folderId}`,
      );*/
      
      const files = response.data.files || [];

      // aaa.xml または aaa.json を検索
      for (const file of files) {
        const fileName = file.name || '';
        const mimeType = file.mimeType || '';

        if (
          (fileName === `${baseFileName}.xml` &&
            mimeType === PlayerConstants.MIME_TYPES.XML) ||
          (fileName === `${baseFileName}.json` &&
            mimeType === PlayerConstants.MIME_TYPES.JSON)
        ) {
          return {
            id: file.id || '',
            name: fileName,
            mimeType,
            size: file.size ? parseInt(file.size as string, 10) : undefined,
            parentId: (file.parents as any)?.[0]?.id,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('[PlayerService] Error finding comment file:', {
        error: error instanceof Error ? error.message : String(error),
        folderId,
        videoFileName,
      });
      // エラーの場合は null を返す（コメント無しとして扱う）
      return null;
    }
  }

  /**
   * ファイル内容をテキストとしてダウンロード
   * @returns ファイル内容（文字列）
   */
  private async downloadFileContent(userId: bigint, fileId: string): Promise<string> {
    try {
      const accessToken = await this.tokenService.getValidAccessToken(userId);
      
      const oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials({ access_token: accessToken });

      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const response = await drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' },
      );

      // バイナリをテキストに変換
      const content = Buffer.from(response.data as ArrayBuffer).toString('utf-8');
      return content;
    } catch (error) {
      console.error('[PlayerService] Error downloading file content:', {
        error: error instanceof Error ? error.message : String(error),
        fileId,
      });
      throw error;
    }
  }

  /**
   * Range ヘッダーをパース
   * @param rangeHeader - Range ヘッダー値（e.g., "bytes=0-1023"）
   * @param fileSize - ファイルサイズ
   * @returns パースされた Range 情報
   */
  private parseRangeHeader(rangeHeader: string, fileSize: number): RangeInfo | null {
    // Range ヘッダーの形式をチェック
    const rangeMatch = rangeHeader.match(/^bytes=(\d+)?-(\d+)?$/);
    if (!rangeMatch) {
      return null;
    }

    const startStr = rangeMatch[1];
    const endStr = rangeMatch[2];

    let start = 0;
    let end = fileSize - 1;

    // bytes=start-end の形式
    if (startStr && endStr) {
      start = parseInt(startStr, 10);
      end = parseInt(endStr, 10);

      // 無効な範囲をチェック
      if (start > end || start < 0 || end >= fileSize) {
        return null;
      }
    }
    // bytes=start- の形式（最後まで）
    else if (startStr && !endStr) {
      start = parseInt(startStr, 10);
      if (start < 0 || start >= fileSize) {
        return null;
      }
      end = fileSize - 1;
    }
    // bytes=-end の形式（最後 end バイト）
    else if (!startStr && endStr) {
      const lastBytes = parseInt(endStr, 10);
      if (lastBytes <= 0) {
        return null;
      }
      start = Math.max(0, fileSize - lastBytes);
      end = fileSize - 1;
    }
    // 無効な形式
    else {
      return null;
    }

    return { start, end, size: fileSize };
  }

  /**
   * 動画をストリーミング取得（Range 対応）
   * @param userId - ユーザーID
   * @param videoFileId - 動画ファイルID
   * @param rangeHeader - Range ヘッダー（オプション）
   * @returns ストリーム情報（ステータスコード、ヘッダー含む）
   */
  async getVideoStreamWithRange(
    userId: bigint,
    videoFileId: string,
    rangeHeader?: string,
  ): Promise<StreamResponse> {
    const accessToken = await this.tokenService.getValidAccessToken(userId);
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // ファイルメタデータを取得（サイズ確認）
    const fileMetadata = await drive.files.get({
      fileId: videoFileId,
      fields: 'id,name,mimeType,size',
    });

    // MIME タイプが MP4 であることを確認
    if (fileMetadata.data.mimeType !== PlayerConstants.MIME_TYPES.VIDEO_MP4) {
      throw new BadRequestException(
        `Invalid file type: ${fileMetadata.data.mimeType}. Only MP4 videos are supported.`,
      );
    }

    const fileSize = fileMetadata.data.size
      ? parseInt(fileMetadata.data.size as string, 10)
      : 0;

    // Range ヘッダーをパース
    let rangeInfo: RangeInfo | null = null;
    let statusCode = PlayerConstants.HTTP_STATUS.OK;
    let contentLength = fileSize;
    let contentRange: string | undefined;

    if (rangeHeader) {
      rangeInfo = this.parseRangeHeader(rangeHeader, fileSize);

      if (!rangeInfo) {
        // Range が無効な場合は 416 Range Not Satisfiable を返す
        throw new BadRequestException(
          `Invalid Range: bytes */` + fileSize,
        );
      }

      statusCode = PlayerConstants.HTTP_STATUS.PARTIAL_CONTENT;
      contentLength = rangeInfo.end - rangeInfo.start + 1;
      contentRange = `bytes ${rangeInfo.start}-${rangeInfo.end}/${fileSize}`;
    }

    // GDrive API からファイルをダウンロード（Range 指定）
    const response = await drive.files.get(
      {
        fileId: videoFileId,
        alt: 'media',
      },
      {
        responseType: 'stream',
        headers: rangeInfo
          ? {
              Range: `bytes=${rangeInfo.start}-${rangeInfo.end}`,
            }
          : undefined,
      },
    );

    return {
      stream: response.data,
      statusCode,
      headers: {
        contentType: PlayerConstants.MIME_TYPES.VIDEO_MP4,
        contentLength,
        contentRange,
        acceptRanges: PlayerConstants.RANGE.ACCEPT_RANGES,
      },
    };
  }

}
