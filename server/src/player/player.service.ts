import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import type { Database } from '../database/database.module';
import { driveConnections } from '../database';
import { eq, and } from 'drizzle-orm';
import { CommentDto, DPlayerCommentDto } from './dto';
import { XmlParser } from './utils/xml-parser';
import { CommentConverter } from './utils/comment-converter';
import { TokenService } from '../auth/services';
import { LoggerService } from '../common/logger/logger.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { ProviderType } from '../drive/constants';
import {
  PlayerCommonConstants,
  PlayerGoogleConstants,
} from './constants';
import {
  GooglePlayerProvider,
  OnedrivePlayerProvider,
  PlayerProvider,
  PlayerFileInfo,
  PlayerStreamResponse,
  RangeInfo,
} from './providers';

type FileInfo = PlayerFileInfo;
type StreamResponse = PlayerStreamResponse;

/**
 * プレイヤー Service（共通＋ルーティング層）
 * 動画ストリーミング とコメント取得を管理
 * マルチプロバイダー対応：Google Drive, OneDrive
 */
@Injectable()
export class PlayerService {
  private readonly googleProvider: GooglePlayerProvider;
  private readonly onedriveProvider: OnedrivePlayerProvider;

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: Database,
    private readonly xmlParser: XmlParser,
    private readonly commentConverter: CommentConverter,
    private readonly tokenService: TokenService,
    private readonly logger: LoggerService,
    private readonly encryptionService: EncryptionService,
  ) {
    // プロバイダーをインスタンス化
    this.googleProvider = new GooglePlayerProvider();
    this.onedriveProvider = new OnedrivePlayerProvider();
  }

  /**
   * プロバイダーを取得（ルーティング）
   */
  private getProvider(providerName: string): PlayerProvider {
    if (providerName === ProviderType.GOOGLE) {
      return this.googleProvider;
    } else if (providerName === ProviderType.ONEDRIVE) {
      return this.onedriveProvider;
    }
    throw new InternalServerErrorException(
      `Unsupported provider: ${providerName}`,
    );
  }

  /**
   * プロバイダータイプから接続情報を取得
   */
  private async getProviderConnection(
    userId: bigint,
    connectionId: bigint,
  ): Promise<{ provider: PlayerProvider; providerName: string }> {
    const connection = await this.db.query.driveConnections.findFirst({
      where: and(
        eq(driveConnections.id, connectionId),
        eq(driveConnections.user_id, userId),
        eq(driveConnections.is_active, true),
      ),
    });

    if (!connection) {
      throw new NotFoundException('Drive connection not found or inactive');
    }

    const provider = this.getProvider(connection.provider_name);
    return { provider, providerName: connection.provider_name };
  }

  /**
   * 動画ファイルをストリーミング取得（マルチプロバイダー対応）
   */
  async getVideoStream(
    userId: bigint,
    connectionId: bigint,
    videoFileId: string,
  ): Promise<NodeJS.ReadableStream> {
    const { provider, providerName } = await this.getProviderConnection(
      userId,
      connectionId,
    );
    const accessToken = await this.tokenService.getValidAccessToken(
      userId,
      providerName,
      connectionId,
    );
    return provider.getVideoStream(accessToken, videoFileId);
  }

  /**
   * 動画ファイルのメタデータを取得（マルチプロバイダー対応）
   */
  async getVideoMetadata(
    userId: bigint,
    connectionId: bigint,
    videoFileId: string,
  ): Promise<FileInfo> {
    const { provider, providerName } = await this.getProviderConnection(
      userId,
      connectionId,
    );
    const accessToken = await this.tokenService.getValidAccessToken(
      userId,
      providerName,
      connectionId,
    );
    return provider.getVideoMetadata(accessToken, videoFileId);
  }

  /**
   * 動画に対応するコメントを取得
   */
  async getCommentsByVideoId(
    userId: bigint,
    videoFileId: string,
    folderId: string,
    connectionId: bigint,
  ): Promise<CommentDto[]> {
    try {
      this.logger.debug(
        `[PlayerService] Getting comments for videoFileId: ${videoFileId}, folderId: ${folderId}`,
      );

      const videoFile = await this.getVideoMetadata(userId, connectionId, videoFileId);
      this.logger.debug(
        `[PlayerService] Retrieved video metadata: name=${videoFile.name}`,
      );

      // 2. 対応するコメントファイルを検索
      const commentFile = await this.findCommentFile(
        userId,
        folderId,
        videoFile.name,
      );

      if (!commentFile) {
        // コメント無し
        this.logger.debug(
          `[PlayerService] No comment file found for video: ${videoFile.name}`,
        );
        return [];
      }

      // 3. ファイルをダウンロード・パース
      const fileContent = await this.downloadFileContent(
        userId,
        commentFile.id,
      );
      const comments = await this.xmlParser.parseCommentFile(
        fileContent,
        commentFile.mimeType,
      );

      this.logger.debug(
        `[PlayerService] Successfully loaded ${comments.length} comments for video: ${videoFile.name}`,
      );
      return comments;
    } catch (error) {
      // エラー時はログして空配列を返す（動画再生は継続）
      this.logger.error('[PlayerService] Failed to get comments:', {
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
      const comments = await this.getCommentsByVideoId(
        userId,
        videoFileId,
        folderId,
      );

      // ✅ DPlayer 互換形式に変換
      const dplayerComments =
        this.commentConverter.convertCommentsToDPlayer(comments);

      this.logger.debug(
        `[PlayerService] Converted ${dplayerComments.length} comments to DPlayer format`,
      );
      return dplayerComments;
    } catch (error) {
      this.logger.error('[PlayerService] Failed to get comments for DPlayer:', {
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

      this.logger.debug(
        `[PlayerService] Searching for comment file for video: ${videoFileName} in folder: ${folderId}`,
      );

      // ✅ フォルダ内のすべてのファイルを取得
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: PlayerGoogleConstants.API.LIST_FIELDS,
        pageSize: PlayerGoogleConstants.API.PAGE_SIZE,
        supportsAllDrives: true,
      });

      const files = response.data.files || [];

      // aaa.xml または aaa.json を検索
      for (const file of files) {
        const fileName = file.name || '';
        const mimeType = file.mimeType || '';

        if (
          (fileName === `${baseFileName}.xml` &&
            mimeType === PlayerCommonConstants.MIME_TYPES.XML) ||
          (fileName === `${baseFileName}.json` &&
            mimeType === PlayerCommonConstants.MIME_TYPES.JSON)
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
      this.logger.error('[PlayerService] Error finding comment file:', {
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
  private async downloadFileContent(
    userId: bigint,
    fileId: string,
  ): Promise<string> {
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
      const content = Buffer.from(response.data as ArrayBuffer).toString(
        'utf-8',
      );
      return content;
    } catch (error) {
      this.logger.error('[PlayerService] Error downloading file content:', {
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
  private parseRangeHeader(
    rangeHeader: string,
    fileSize: number,
  ): RangeInfo | null {
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
   * 動画をストリーミング取得（Range 対応、マルチプロバイダー）
   */
  async getVideoStreamWithRange(
    userId: bigint,
    connectionId: bigint,
    videoFileId: string,
    rangeHeader?: string,
  ): Promise<StreamResponse> {
    try {
      this.logger.info(`🎬 getVideoStreamWithRange called`);
      this.logger.debug(
        `  - userId: ${userId}, connectionId: ${connectionId}, fileId: ${videoFileId}`,
      );

      // ストレージプロバイダー接続情報を取得
      const { provider, providerName } = await this.getProviderConnection(
        userId,
        connectionId,
      );

      // トークン取得
      this.logger.info(`🔐 Getting valid access token...`);
      const accessToken = await this.tokenService.getValidAccessToken(
        userId,
        providerName,
        connectionId,
      );
      this.logger.debug(
        `✅ Access token obtained (preview: ${accessToken.substring(0, 30)}...)`,
      );

      // プロバイダー経由でストリーミング取得
      return await provider.getVideoStreamWithRange(
        accessToken,
        videoFileId,
        rangeHeader,
      );
    } catch (error) {
      this.logger.error(
        `❌ getVideoStreamWithRange failed: ${(error as Error).message}`,
        error as Error,
      );
      throw error;
    }
  }
}
