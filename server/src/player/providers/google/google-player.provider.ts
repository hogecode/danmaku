import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import {
  PlayerProvider,
  PlayerFileInfo,
  PlayerStreamResponse,
} from '../player.provider.interface';
import {
  PlayerCommonConstants,
  PlayerGoogleConstants,
} from '../../constants';
import { GooglePlayerBase } from './google-player-base.provider';

/**
 * Google Drive ビデオプレイヤー プロバイダー
 */
@Injectable()
export class GooglePlayerProvider extends GooglePlayerBase
  implements PlayerProvider {
  async getVideoStream(
    accessToken: string,
    videoFileId: string,
  ): Promise<NodeJS.ReadableStream> {
    const client = this.createOAuth2Client(accessToken);
    const drive = google.drive({ version: 'v3', auth: client });

    const fileMetadata = await drive.files.get({
      fileId: videoFileId,
      fields: PlayerGoogleConstants.API.BASIC_FIELDS,
    });

    this.validateMimeType(fileMetadata.data.mimeType);

    const response = await drive.files.get(
      { fileId: videoFileId, alt: 'media' },
      { responseType: 'stream' },
    );

    return response.data;
  }

  async getVideoMetadata(
    accessToken: string,
    videoFileId: string,
  ): Promise<PlayerFileInfo> {
    const fileResponse = await this.fetchVideoMetadata(
      accessToken,
      videoFileId,
    );

    if (!fileResponse.data.id) {
      throw new Error(`Video file not found: ${videoFileId}`);
    }

    return {
      id: fileResponse.data.id,
      name: fileResponse.data.name || '',
      mimeType: fileResponse.data.mimeType || '',
      size: this.getFileSize(fileResponse),
      parentId: undefined,
    };
  }

  async getVideoStreamWithRange(
    accessToken: string,
    videoFileId: string,
    rangeHeader?: string,
  ): Promise<PlayerStreamResponse> {
    const client = this.createOAuth2Client(accessToken);
    const drive = google.drive({ version: 'v3', auth: client });

    const fileMetadata = await drive.files.get({
      fileId: videoFileId,
      fields: PlayerGoogleConstants.API.BASIC_FIELDS,
    });

    this.validateMimeType(fileMetadata.data.mimeType);

    const fileSize = this.getFileSize(fileMetadata);
    let rangeInfo = null;
    let statusCode = PlayerCommonConstants.HTTP_STATUS.OK;
    let contentLength = fileSize;
    let contentRange: string | undefined;

    if (rangeHeader) {
      rangeInfo = this.parseRangeHeader(rangeHeader, fileSize);
      if (!rangeInfo) {
        statusCode = PlayerCommonConstants.HTTP_STATUS.RANGE_NOT_SATISFIABLE;
        contentRange = `bytes */${fileSize}`;
      } else {
        statusCode = PlayerCommonConstants.HTTP_STATUS.PARTIAL_CONTENT;
        contentLength = rangeInfo.end - rangeInfo.start + 1;
        contentRange = `bytes ${rangeInfo.start}-${rangeInfo.end}/${fileSize}`;
      }
    }

    let response;
    if (rangeInfo) {
      response = await drive.files.get(
        { fileId: videoFileId, alt: 'media' },
        {
          responseType: 'stream',
          headers: { Range: `bytes=${rangeInfo.start}-${rangeInfo.end}` },
        },
      );
    } else {
      response = await drive.files.get(
        { fileId: videoFileId, alt: 'media' },
        { responseType: 'stream' },
      );
    }

    return {
      stream: response.data,
      statusCode,
      headers: {
        contentType: PlayerCommonConstants.MIME_TYPES.VIDEO_MP4,
        contentLength,
        contentRange,
        acceptRanges: PlayerCommonConstants.RANGE.ACCEPT_RANGES,
      },
    };
  }

  async listFiles(
    accessToken: string,
    folderId: string,
    pageToken?: string,
  ): Promise<{ items: PlayerFileInfo[]; nextPageToken?: string }> {
    const client = this.createOAuth2Client(accessToken);
    const drive = google.drive({ version: 'v3', auth: client });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: PlayerGoogleConstants.API.LIST_FIELDS,
      pageSize: PlayerGoogleConstants.API.PAGE_SIZE,
      pageToken: pageToken || undefined,
      supportsAllDrives: true,
    });

    return {
      items: (response.data.files || []).map((file) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size ? parseInt(file.size as string, 10) : undefined,
        parentId: folderId,
      })),
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }
}
