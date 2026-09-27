/**
 * Kakolog (2ch実況ログ) 関連の型定義
 */

/**
 * Kakolog XML コメント（2ch実況形式）
 */
export interface KakologComment {
  thread: string;      // スレッドID
  no: number;          // コメント番号
  vpos: number;        // ビデオポジション（秒単位）
  date: number;        // Unix timestamp
  dateUsec?: string;   // マイクロ秒
  mail?: string;       // コメント属性（色、サイズ、位置など）
  userId?: string;     // ユーザーID（匿名の場合は省略）
  premium?: number;    // プレミアム会員フラグ
  anonymity?: number;  // 匿名フラグ
  text: string;        // コメント内容
}

/**
 * Kakolog API レスポンス（XML形式）
 */
export interface KakologApiResponse {
  comments: KakologComment[];
  total: number;        // 総コメント数
  retrieved: number;    // 取得したコメント数
}
