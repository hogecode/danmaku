/**
 * DPlayer 互換コメント形式
 * @see https://dplayer.js.org/
 */
export interface DPlayerComment {
  time: number;

  /**
   * コメント種類
   * - "normal": 中央スクロール
   * - "top"/"ue": 上部表示
   * - "bottom"/"shita": 下部表示
   */
  type: 'normal' | 'top' | 'bottom';

  size: 'small' | 'normal' | 'big';

  /**
   * コメント色（16進数カラーコード）
   */
  color: string;

  author?: string | null;

  text: string;
}

/**
 * DPlayer 互換コメント一覧レスポンス
 */
export interface DPlayerCommentListResponse {
  comments: DPlayerComment[];
}
