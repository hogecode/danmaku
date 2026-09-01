/**
 * コメント DTO（XML/JSON 統一フォーマット）
 * ニコニコ実況形式に準拠
 */
export class CommentDto {
  /**
   * スレッドID
   */
  thread?: string;

  /**
   * コメント番号
   */
  no!: number;

  /**
   * 再生位置（ミリ秒単位）
   */
  vpos!: number;

  /**
   * UNIXタイムスタンプ
   */
  date!: number;

  /**
   * 表示フォーマット指定
   * 例: "184", "184 big ue", "ue", "big" など
   */
  mail?: string;

  /**
   * ユーザーID
   */
  user_id?: string;

  /**
   * プレミアムユーザーフラグ
   */
  premium?: number;

  /**
   * 匿名投稿フラグ
   */
  anonymity?: number;

  /**
   * コメント内容（テキスト）
   */
  text!: string;
}
