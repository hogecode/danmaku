/**
 * DPlayer形式のコメント
 *
 * OpenAPI生成時に正確な型情報を保持するため、
 * interface ではなく class を使用します
 */
export class DPlayerCommentDto {
  /** コメント表示時刻（秒単位） */
  time!: number;

  /** コメント種類: "normal", "top", "bottom" */
  type!: string;

  /** コメントサイズ: "small", "medium", "big" */
  size!: string;

  /** コメント色（ニコ動の色番号、例: "184"） */
  color!: string;

  /** 投稿者ID（匿名の場合は null） */
  author!: string | null;

  /** コメント内容 */
  text!: string;
}

/**
 * レスポンスの data フィールド
 */
export class CommentDataDto {
  title!: string;
  commentCount!: number;
  retrievedCount!: number;
  threads!: number;
}

/**
 * レスポンスの comments.globalComments フィールド
 */
export class GlobalCommentsDto {
  commentCount!: number;
  retrievedCount!: number;
}

/**
 * レスポンスの comments.threads[].* アイテム
 */
export class CommentThreadDto {
  id!: string | number;
  comments!: DPlayerCommentDto[];
}

/**
 * レスポンスの comments フィールド
 */
export class CommentsContainerDto {
  globalComments!: GlobalCommentsDto;
  threads!: CommentThreadDto[];
}

/**
 * ニコ動コメント取得レスポンス（DPlayer形式）
 */
export class DownloadCommentWithDPlayerResponseDto {
  videoId!: string;
  status!: 'completed' | 'failed';
  message!: string;
  data!: CommentDataDto;
  comments!: CommentsContainerDto;
}

/**
 * ニコ動コメント取得エラーレスポンス
 */
export class DownloadCommentErrorResponseDto {
  status!: 'failed';
  message!: string;
}
