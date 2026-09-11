/**
 * ファイルユーティリティサービスクラス
 * Google Drive ファイルの操作に関する汎用メソッドを提供
 */

import { FOLDER_MIME_TYPE, VIDEO_MIME_TYPES } from '@/utils/constants';

export class FileUtility {
  /**
   * フォルダかどうかを判定
   */
  static isFolder(mimeType: string): boolean {
    return mimeType === FOLDER_MIME_TYPE;
  }

  /**
   * ビデオファイルかどうかを判定
   */
  static isVideo(mimeType: string): boolean {
    return VIDEO_MIME_TYPES.some((vmt) => mimeType.includes(vmt));
  }

  /**
   * ファイル名からMIMEタイプを推測
   */
  static getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const mimeMap: Record<string, string> = {
      mp4: 'video/mp4',
      mkv: 'video/x-matroska',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      flv: 'video/x-flv',
      wmv: 'video/x-ms-wmv',
      webm: 'video/webm',
      m3u8: 'application/vnd.apple.mpegurl',
    };
    return mimeMap[ext] || 'application/octet-stream';
  }

  /**
   * ファイルサイズを人間が読める形にフォーマット
   */
  static formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
