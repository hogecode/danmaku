import { CommentDto } from './comment.dto';

/**
 * コメント一覧レスポンス DTO
 */
export class CommentListDto {
  /**
   * コメント配列
   */
  comments!: CommentDto[];
}
