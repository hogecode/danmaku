/**
 * ファイル操作ユーティリティ
 */

export class FileUtility {
  /**
   * ビデオファイルかどうかを判定
   */
  static isVideo(mimeType?: string): boolean {
    if (!mimeType) return false;
    const videoMimes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
      'video/x-quicktime',
      'video/x-flv',
      'video/x-ms-wmv',
      'video/3gpp',
      'video/mp2t',
    ];
    return videoMimes.includes(mimeType);
  }

  /**
   * フォルダかどうかを判定
   */
  static isFolder(mimeType?: string): boolean {
    return mimeType === 'application/vnd.google-apps.folder';
  }

  /**
   * ファイルサイズをフォーマット
   */
  static formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  /**
   * 日時をフォーマット
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * ファイル種別アイコン絵文字を取得
   */
  static getFileIcon(mimeType?: string): string {
    if (this.isVideo(mimeType)) return '🎬';
    if (this.isFolder(mimeType)) return '📁';
    return '📄';
  }
}
