/**
 * GDrive ファイル取得 Hook
 * TanStack Query でラップされたファイルリスト取得
 */

import { useQuery } from '@tanstack/react-query';
import { fetchFolderContents } from '@/lib/api/gdrive-client';

/**
 * GDrive フォルダ内のファイルリストを TanStack Query で取得
 * 
 * @example
 * const { data: files, isLoading, error } = useGdriveFiles(folderId);
 */
export function useGdriveFiles(
  folderId?: string,
  options = {},
) {
  return useQuery({
    queryKey: ['gdriveFiles', folderId],
    queryFn: async () => {
      if (!folderId) {
        throw new Error('folderId is required');
      }
      return fetchFolderContents(folderId);
    },
    enabled: !!folderId, // folderId がない場合はクエリを実行しない
    staleTime: 1000 * 60 * 5, // 5分でスタイル
    gcTime: 1000 * 60 * 30, // 30分でガベージコレクション
    retry: 2,
    ...options,
  });
}

/**
 * useGdriveFilesInfinite
 * 
 * ページネーション対応版（今後の拡張用）
 */
export function useGdriveFilesInfinite(
  folderId?: string,
) {
  // TODO: バックエンド側がページネーション対応になった時に実装
  return useGdriveFiles(folderId);
}
