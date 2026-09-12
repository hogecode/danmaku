/**
 * コメント DTO（XML/JSON 統一フォーマット）
 * ニコニコ実況形式に準拠
 */
export class CommentDto {

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
  
  user_id?: string;
  premium?: number;
  anonymity?: number;
  text!: string;
}
