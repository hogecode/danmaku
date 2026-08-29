import { FileItemDto } from './file-item.dto';

/**
 * フォルダ内容リスト DTO
 */
export class FolderListDto {
  /**
   * フォルダ内のファイル/フォルダ一覧
   */
  items!: FileItemDto[];

  /**
   * 次のページトークン（ページネーション用）
   * あれば指定してリクエスト
   */
  nextPageToken?: string;
}
