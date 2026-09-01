import { DPlayerCommentDto } from './dplayer-comment.dto';

/**
 * DPlayer 互換コメント一覧レスポンス DTO
 */
export class DPlayerCommentListDto {
  /**
   * DPlayer 互換コメント配列
   */
  comments!: DPlayerCommentDto[];
}
