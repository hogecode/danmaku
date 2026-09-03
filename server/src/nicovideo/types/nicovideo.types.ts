/**
 * ニコ動関連の型定義
 */

/**
 * コメント情報
 */
export interface NicovideoComment {
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
export interface NicovideoCommentThread {
  id: number | string;
  fork: string;
  comments: NicovideoComment[];
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
  threads: NicovideoCommentThread[];
}

/**
 * 動画メタデータ
 * コメント取得に必要なthread_key等のパラメータを含む
 */
export interface NicovideoVideoMetadata {
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
 * ログイン要求
 */
export interface NicovideoLoginRequest {
  email: string;
  password: string;
}

/**
 * 認証トークン情報
 */
export interface NicovideoAuthToken {
  sessionCookie: string;
  createdAt: number;
  updatedAt: number;
}
