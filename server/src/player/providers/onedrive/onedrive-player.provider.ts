import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  PlayerProvider,
  PlayerFileInfo,
  PlayerStreamResponse,
} from '../player.provider.interface';

/**
 * OneDrive ビデオプレイヤー プロバイダー
 * TODO: Microsoft Graph API 実装
 */
@Injectable()
export class OnedrivePlayerProvider implements PlayerProvider {
  private throwNotImplemented(): never {
    throw new InternalServerErrorException(
      'OneDrive player functionality is not yet implemented',
    );
  }

  async getVideoStream(
    accessToken: string,
    videoFileId: string,
  ): Promise<NodeJS.ReadableStream> {
    this.throwNotImplemented();
  }

  async getVideoMetadata(
    accessToken: string,
    videoFileId: string,
  ): Promise<PlayerFileInfo> {
    this.throwNotImplemented();
  }

  async getVideoStreamWithRange(
    accessToken: string,
    videoFileId: string,
    rangeHeader?: string,
  ): Promise<PlayerStreamResponse> {
    this.throwNotImplemented();
  }

  async listFiles(
    accessToken: string,
    folderId: string,
    pageToken?: string,
  ): Promise<{ items: PlayerFileInfo[]; nextPageToken?: string }> {
    this.throwNotImplemented();
  }
}
