/**
 * DPlayer 互換コメント形式
 * @see https://dplayer.js.org/
 */
export interface DPlayerComment {
  /**
   * コメント表示時刻（秒単位の浮動小数点数）
   */
  time: number;

  /**
   * コメント種類
   * - "normal": 中央スクロール
   * - "top"/"ue": 上部表示
   * - "bottom"/"shita": 下部表示
   */
  type: 'normal' | 'top' | 'bottom';

  /**
   * コメント文字サイズ
   * - "small": 小
   * - "normal": 通常
   * - "big": 大
   */
  size: 'small' | 'normal' | 'big';

  /**
   * コメント色（16進数カラーコード）
   */
  color: string;

  /**
   * コメント投稿者ID（匿名の場合は null）
   */
  author?: string | null;

  /**
   * コメント内容
   */
  text: string;
}

/**
 * DPlayer 互換コメント一覧レスポンス
 */
export interface DPlayerCommentListResponse {
  comments: DPlayerComment[];
}
