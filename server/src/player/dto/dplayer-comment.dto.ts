/**
 * DPlayer 互換コメント DTO
 * 
 * DPlayer が期待するコメント形式
 * @see https://dplayer.js.org/
 */
export class DPlayerCommentDto {
  /**
   * コメント表示時刻（秒単位の浮動小数点数）
   * 例: 10.5 (10秒500ミリ秒)
   */
  time!: number;

  /**
   * コメント種類
   * - "normal" (中央)
   * - "top" / "ue" (上)
   * - "bottom" / "shita" (下)
   */
  type!: string;

  /**
   * コメント文字サイズ
   * - "small" (小)
   * - "normal" / "" (通常)
   * - "big" (大)
   */
  size!: string;

  /**
   * コメント色（16進数カラーコード）
   * 例: "#ffffff" (白)
   */
  color!: string;

  /**
   * コメント投稿者ID（匿名の場合は null）
   */
  author?: string | null;

  /**
   * コメント内容（テキスト）
   */
  text!: string;
}
