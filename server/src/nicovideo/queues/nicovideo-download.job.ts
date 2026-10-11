/**
 * ニコ動ダウンロードジョブのデータ型定義
 */

/**
 * キューに渡されるジョブデータ
 */
export interface NicovideoDownloadJobData {
  jobId: string;
  videoId: string;
  quality: 'high' | 'low' | 'auto';
  downloadComments: boolean;
  downloadedAt: Date;
  userId?: string;
}

/**
 * ジョブ実行後の結果データ
 */
export interface NicovideoDownloadJobResult {
  jobId: string;
  videoId: string;
  fileName: string;
  s3Key: string;
  s3Url: string;
  fileSize: number;
  commentCount?: number;
  completedAt: Date;
}

/**
 * ジョブの進捗情報
 */
export interface NicovideoDownloadProgress {
  step:
    | 'queued'
    | 'initializing'
    | 'accessing_nicovideo'
    | 'downloading_video'
    | 'downloading_comments'
    | 'uploading_s3'
    | 'completed';
  percentage: number;
  message: string;
  timestamp: Date;
  error?: string;
}

/**
 * Pub/Sub イベント（ワーカーからSSEへの通信）
 */
export interface NicovideoDownloadPubSubEvent {
  jobId: string;
  type: 'progress' | 'completed' | 'failed';
  progress?: NicovideoDownloadProgress;
  result?: NicovideoDownloadJobResult;
  error?: string;
}
