/**
 * OneDrive API 固有定数
 */
export class OnedriveDriveConstants {
  // OneDrive MIME Type（Microsoft Graph API）
  static readonly MIME_TYPES = {
    FOLDER: 'application/vnd.microsoft.graph.driveItem',
    VIDEO_MP4: 'video/mp4',
  };

  // OneDrive API 設定
  static readonly API = {
    // Microsoft Graph API の $select パラメータ
    SELECT:
      'id,name,webUrl,lastModifiedDateTime,size,folder,thumbnails',
    PAGE_SIZE: 200, // OneDrive のページングサイズ
  };

  // プライベートコンストラクタ
  private constructor() {}
}
