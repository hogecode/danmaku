/**
 * ニコ動関連の型定義
 */

/**
 * コメント情報
 */
export interface NicovideComment {
  id?: string;
  no?: number;
  vpos: number; // ビデオポジション（ミリ秒）
  date: number; // Unix timestamp
  mail?: string;
  user_id: string;
  premium?: number;
  anonymity?: number;
  text: string;
  fork?: string;
  postedAt?: string;
}

/**
 * コメントスレッド
 */
export interface NicovideCommentThread {
  id: number | string;
  fork: string;
  comments: NicovideComment[];
  commentCount?: number;
  retrievedCount: number;
}

/**
 * コメント応答データ
 */
export interface CommentsData {
  globalComments: {
    retrievedCount: number;
    commentCount: number;
  };
  threads: NicovideCommentThread[];
}

/**
 * 動画メタデータ
 * コメント取得に必要なthread_key等のパラメータを含む
 */
export interface NicovideVideoMetadata {
  id: string;
  title: string;
  description: string;
  uploader: string;
  uploaderId?: number;
  duration: number; // 秒
  viewCount: number;
  commentCount: number;
  mylistCount: number;
  likeCount: number;
  publishedAt: string; // ISO 8601
  thumbnailUrl: string;
  tags: string[];
  
  // コメント取得に必須
  threadKey: string;  // ニコ動コメントAPI認証用キー
  commentServer: string;  // コメント取得先サーバー
  threads: Array<{
    id: string | number;
    fork: string;
  }>;
  threadParams?: {
    targets: Array<{
      id: string | number;
      fork: string;
    }>;
    language: string;
  };
}

/**
 * DMS (Dwango Media Service) ストリーム情報
 */
export interface DMSStreamInfo {
  video_uri?: string;
  audio_uri?: string;
  quality?: string;
}

/**
 * DMC (Dwango Media Cluster) セッション情報
 */
export interface DMCSessionInfo {
  url: string;
  recipeId: string;
  contentId: string;
  protocol: string;
  priority: string;
  heartbeatLifetime: number;
  token: string;
  signature: string;
  authType: string;
  serviceUserId: string;
  playerId: string;
}

/**
 * ダウンロードタスク情報
 */
export interface DownloadTaskInfo {
  taskId: string;
  videoId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress?: number; // 0-100
  downloadedSize?: number; // bytes
  totalSize?: number; // bytes
  downloadUrl?: string;
  error?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

/**
 * ビデオ情報レスポンス
 */
export interface NicovideVideoResponse {
  isDeleted: boolean;
  isPremium: boolean;
  isAdmission: boolean;
  isPpv: boolean;
  dmsAvailable: boolean;
  dmcAvailable: boolean;
  video?: {
    id: string;
    title: string;
    description: string;
    duration: number;
    registeredAt: string;
    count: {
      view: number;
      comment: number;
      mylist: number;
      like: number;
    };
    thumbnail: {
      url: string;
      middleUrl: string;
      largeUrl: string;
      playerUrl?: string;
      ogp?: string;
    };
  };
  comment?: {
    nvComment: {
      server: string;
      threadKey: string;
      params: {
        targets: Array<{
          id: string;
          fork: string;
        }>;
        language: string;
      };
    };
    threads: Array<{
      id: string | number;
      fork: string;
    }>;
  };
  media?: {
    domand?: {
      videos: Array<{
        id: string;
        isAvailable: boolean;
        bitRate: number;
        width: number;
        height: number;
        label: string;
      }>;
      audios: Array<{
        id: string;
        isAvailable: boolean;
        bitRate: number;
        samplingRate: number;
      }>;
      accessRightKey: string;
    };
    delivery?: {
      movie: {
        session: {
          urls: Array<{ url: string }>;
          recipeId: string;
          contentId: string;
          protocols: string[];
          priority: string;
          heartbeatLifetime: number;
          token: string;
          signature: string;
          authTypes: {
            http: string;
          };
          serviceUserId: string;
          playerId: string;
        };
        videos: Array<{
          id: string;
          isAvailable: boolean;
          bitRate: number;
          width: number;
          height: number;
          label: string;
          metadata: {
            bitrate: number;
            resolution: {
              width: number;
              height: number;
            };
            label: string;
          };
        }>;
        audios: Array<{
          id: string;
          isAvailable: boolean;
          bitRate: number;
          samplingRate: number;
          metadata: {
            bitrate: number;
            samplingRate: number;
          };
        }>;
      };
    };
  };
  owner?: {
    id: number;
    nickname: string;
  };
  tag?: {
    items: Array<{
      name: string;
    }>;
  };
}

/**
 * ログイン要求
 */
export interface NicovideLoginRequest {
  email: string;
  password: string;
}

/**
 * 認証トークン情報
 */
export interface NicovideAuthToken {
  sessionCookie: string;
  createdAt: number;
  updatedAt: number;
}
