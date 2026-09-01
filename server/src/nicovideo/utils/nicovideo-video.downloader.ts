import { Injectable, Logger } from '@nestjs/common';
import { NicovideoApiClient } from './nicovideo-api.client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ニコ動 動画ダウンロードユーティリティ
 * HLS、DMS、DMC ストリーム対応
 */
@Injectable()
export class NicovideVideoDownloader {
  private readonly logger = new Logger(NicovideVideoDownloader.name);
  private readonly BLOCK_SIZE = 1024 * 1024; // 1MB chunks
  private readonly TEMP_DIR = '/tmp/nicovideo_downloads';

  constructor(private readonly apiClient: NicovideoApiClient) {
    // テンポラリディレクトリ作成
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  /**
   * URL からストリーム DL
   */
  async downloadFromUrl(
    url: string,
    outputPath: string,
    onProgress?: (downloaded: number, total: number) => void,
  ): Promise<string> {
    try {
      // ファイルサイズを取得
      const headers = await this.apiClient.head(url);
      const totalSize = parseInt(headers['content-length'] || '0', 10);

      this.logger.log(
        `ダウンロード開始: ${outputPath} (サイズ: ${totalSize} bytes)`,
      );

      // ストリーム取得
      const response = await this.apiClient.getStream(url);

      // 出力ディレクトリ作成
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // ファイルに書き込み
      const writeStream = fs.createWriteStream(outputPath);
      let downloadedSize = 0;

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          downloadedSize += chunk.length;
          if (onProgress) {
            onProgress(downloadedSize, totalSize);
          }
        });

        response.data.pipe(writeStream);

        writeStream.on('finish', () => {
          this.logger.log(`ダウンロード完了: ${outputPath}`);
          resolve(outputPath);
        });

        writeStream.on('error', (error) => {
          this.logger.error('ダウンロード書き込みエラー:', error);
          fs.unlink(outputPath, () => {});
          reject(error);
        });

        response.data.on('error', (error: any) => {
          this.logger.error('ストリームエラー:', error);
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error('DL エラー:', error);
      throw error;
    }
  }

  /**
   * M3U8 マニフェストから最高品質ストリームを取得
   */
  async getHighestQualityStreamFromM3u8(
    m3u8Url: string,
  ): Promise<string> {
    try {
      const m3u8Content = await this.apiClient.get<string>(m3u8Url, {
        responseType: 'text',
      });

      // ストリーム情報を抽出
      const streams = this._parseM3u8Streams(m3u8Content as any);

      if (streams.length === 0) {
        throw new Error('M3U8 からストリーム情報を取得できません');
      }

      // 最高品質を選択（最初のものが最高品質）
      const bestStream = streams[0];
      const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

      return `${baseUrl}${bestStream}`;
    } catch (error) {
      this.logger.error('M3U8 解析エラー:', error);
      throw error;
    }
  }

  /**
   * M3U8 ストリーム解析
   */
  private _parseM3u8Streams(m3u8Content: string): string[] {
    const streams: string[] = [];
    const lines = m3u8Content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('EXT-X-STREAM-INF')) {
        // 次の行がストリーム URL
        if (i + 1 < lines.length) {
          const streamUrl = lines[i + 1].trim();
          if (streamUrl) {
            streams.push(streamUrl);
          }
        }
      }
    }

    return streams;
  }

  /**
   * テンポラリファイル削除
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.debug(`テンプファイル削除: ${filePath}`);
      }
    } catch (error) {
      this.logger.warn(`テンプファイル削除失敗: ${filePath}`, error);
    }
  }

  /**
   * ファイル拡張子を決定
   */
  determineFileExtension(
    contentType: string,
    defaultExt: string = 'mp4',
  ): string {
    const typeMap: Record<string, string> = {
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/x-matroska': 'mkv',
      'audio/mp4': 'm4a',
      'video/x-msvideo': 'avi',
    };

    return typeMap[contentType] || defaultExt;
  }
}
