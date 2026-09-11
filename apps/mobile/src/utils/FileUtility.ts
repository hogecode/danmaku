/**
 * ファイルユーティリティサービスクラス
 * Google Drive ファイルの操作に関する汎用メソッドを提供
 */

import { FOLDER_MIME_TYPE, VIDEO_MIME_TYPES } from '@/utils/constants';

export class FileUtility {
  /**
   * フォルダかどうかを判定
   * @param mimeType - MIMEタイプ
   * @returns フォルダの場合 true
   */
  static isFolder(mimeType: string): boolean {
    return mimeType === FOLDER_MIME_TYPE;
  }

  /**
   * ビデオファイルかどうかを判定
   * @param mimeType - MIMEタイプ
   * @returns ビデオファイルの場合 true
   */
  static isVideo(mimeType: string): boolean {
    return VIDEO_MIME_TYPES.some((vmt) => mimeType.includes(vmt));
  }

  /**
   * ファイルサイズを人間が読める形にフォーマット
   * @param bytes - ファイルサイズ（バイト）
   * @returns フォーマットされたサイズ文字列（例：1.23 MB）
   * @example
   * FileUtility.formatFileSize(1024) // "1.00 KB"
   * FileUtility.formatFileSize(1048576) // "1.00 MB"
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
