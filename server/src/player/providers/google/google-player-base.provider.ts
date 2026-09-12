import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PlayerFileInfo, RangeInfo } from '../player.provider.interface';
import {
  PlayerCommonConstants,
  PlayerGoogleConstants,
} from '../../constants';

/**
 * Google Drive プレイヤー 基底実装（共通ロジック）
 */
@Injectable()
export class GooglePlayerBase {
  protected createOAuth2Client(accessToken: string): OAuth2Client {
    const client = new OAuth2Client();
    client.setCredentials({ access_token: accessToken });
    return client;
  }

  protected async fetchVideoMetadata(
    accessToken: string,
    videoFileId: string,
  ): Promise<any> {
    const client = this.createOAuth2Client(accessToken);
    const drive = google.drive({ version: 'v3', auth: client });
    return drive.files.get({
      fileId: videoFileId,
      fields: PlayerGoogleConstants.API.BASIC_FIELDS,
      supportsAllDrives: true,
    });
  }

  protected validateMimeType(mimeType: string | undefined | null): void {
    if (mimeType !== PlayerCommonConstants.MIME_TYPES.VIDEO_MP4) {
      throw new BadRequestException(
        `Invalid file type: ${mimeType}. Only MP4 videos are supported.`,
      );
    }
  }

  protected parseRangeHeader(
    rangeHeader: string,
    fileSize: number,
  ): RangeInfo | null {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!match) return null;

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    if (start > end || start >= fileSize) return null;

    return { start, end: Math.min(end, fileSize - 1), size: fileSize };
  }

  protected getFileSize(fileMetadata: any): number {
    return fileMetadata.data.size
      ? parseInt(fileMetadata.data.size as string, 10)
      : 0;
  }
}
