// NodeJS is built-in, no import needed

/**
 * ファイル情報（プロバイダー共通）
 */
export interface PlayerFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  parentId?: string;
}

/**
 * ストリーム応答（プロバイダー共通）
 */
export interface PlayerStreamResponse {
  stream: NodeJS.ReadableStream;
  statusCode: number;
  headers: {
    contentType: string;
    contentLength: number;
    contentRange?: string;
    acceptRanges: string;
  };
}

/**
 * Range ヘッダー情報（共通）
 */
export interface RangeInfo {
  start: number;
  end: number;
  size: number;
}

/**
 * ビデオプレイヤー プロバイダー インターフェース
 * Google Drive, OneDrive, その他プロバイダーが実装
 */
export interface PlayerProvider {
  /**
   * 動画ファイルをストリーミング取得
   */
  getVideoStream(
    accessToken: string,
    videoFileId: string,
  ): Promise<NodeJS.ReadableStream>;

  /**
   * 動画ファイルのメタデータを取得
   */
  getVideoMetadata(
    accessToken: string,
    videoFileId: string,
  ): Promise<PlayerFileInfo>;

  /**
   * 動画をストリーミング取得（Range ヘッダー対応）
   */
  getVideoStreamWithRange(
    accessToken: string,
    videoFileId: string,
    rangeHeader?: string,
  ): Promise<PlayerStreamResponse>;

  /**
   * フォルダ内のファイルを一覧取得
   */
  listFiles(
    accessToken: string,
    folderId: string,
    pageToken?: string,
  ): Promise<{ items: PlayerFileInfo[]; nextPageToken?: string }>;
}
