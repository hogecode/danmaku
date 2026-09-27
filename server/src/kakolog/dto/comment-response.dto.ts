/**
 * Kakolog DPlayer形式コメント DTO
 *
 * ニコ動形式と同じDPlayer互換形式で返す
 */
export class KakologCommentDto {
  /** コメント表示時刻（秒単位） */
  time!: number;

  /** コメント種類: "normal", "top", "bottom" */
  type!: 'normal' | 'top' | 'bottom';

  /** コメントサイズ: "small", "medium", "big" */
  size!: 'small' | 'medium' | 'big';

  /** コメント色（色番号、例: "184"） */
  color!: string;

  /** 投稿者ID（匿名の場合は null） */
  author!: string | null;

  /** コメント内容 */
  text!: string;
}

/**
 * Kakolog コメント取得レスポンス DTO（シンプル版）
 */
export class GetKakologCommentsResponseDto {
  status!: 'completed' | 'failed';
  message?: string;
  channelId!: string;
  startTime!: number;
  endTime!: number;
  commentCount!: number;
  retrievedCount!: number;
  comments!: KakologCommentDto[];
}
