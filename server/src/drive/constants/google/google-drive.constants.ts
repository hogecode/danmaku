/**
 * Google Drive API 固有定数
 */
export class GoogleDriveConstants {
  // MIME Type 定義（Google Drive 固有）
  static readonly MIME_TYPES = {
    FOLDER: 'application/vnd.google-apps.folder',
    // ✅ 複数の動画フォーマットに対応
    VIDEO_MP4: 'video/mp4',
    VIDEO_QUICKTIME: 'video/quicktime',
    VIDEO_AVI: 'video/x-msvideo',
    VIDEO_WEBM: 'video/webm',
    VIDEO_MKV: 'video/x-matroska',
    VIDEO_MOV: 'video/x-quicktime',
    VIDEO_FLV: 'video/x-flv',
    VIDEO_WMV: 'video/x-ms-wmv',
    VIDEO_3GP: 'video/3gpp',
    VIDEO_TS: 'video/mp2t',
  };

  // Google Drive API 設定
  static readonly API = {
    FIELDS:
      'nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink,size,thumbnailLink,parents)',
    PAGE_SIZE: 1000,
  };

  /**
   * 取得対象のフォルダと動画の MIME Type を配列で取得
   * @returns フォルダと動画の MIME Types 配列
   */
  static getFilteredMimeTypes(): string[] {
    return [
      this.MIME_TYPES.FOLDER,
      this.MIME_TYPES.VIDEO_MP4,
      this.MIME_TYPES.VIDEO_QUICKTIME,
      this.MIME_TYPES.VIDEO_AVI,
      this.MIME_TYPES.VIDEO_WEBM,
      this.MIME_TYPES.VIDEO_MKV,
      this.MIME_TYPES.VIDEO_MOV,
      this.MIME_TYPES.VIDEO_FLV,
      this.MIME_TYPES.VIDEO_WMV,
      this.MIME_TYPES.VIDEO_3GP,
      this.MIME_TYPES.VIDEO_TS,
    ];
  }

  /**
   * フィルタリング用のクエリ文字列を生成
   * @returns Google Drive API の q パラメータ用クエリ
   */
  static getFilterQuery(): string {
    const mimeTypes = this.getFilteredMimeTypes();
    // ✅ mimeType が FOLDER またはいずれかの動画形式の場合のみ
    return mimeTypes.map((mime) => `mimeType='${mime}'`).join(' or ');
  }

  // プライベートコンストラクタ
  private constructor() {}
}
