/**
 * プレイヤーコメント取得 Hook
 * TanStack Query でラップされたコメント取得
 */

import { useQuery } from '@tanstack/react-query';
import { fetchVideoComments } from '@/lib/api/player-client';
import type { DPlayerComment } from '@/lib/api/dplayer-comment';

/**
 * usePlayerComments
 * 
 * DPlayer 互換形式のコメントを TanStack Query で取得
 * 
 * @param videoFileId - 動画ファイル ID
 * @param folderId - フォルダ ID
 * @param options - useQuery オプション
 * @returns useQuery 結果
 * 
 * @example
 * const { data, isLoading, error } = usePlayerComments(videoFileId, folderId);
 */
export function usePlayerComments(
  videoFileId?: string,
  folderId?: string,
  options = {},
) {
  return useQuery({
    queryKey: ['playerComments', videoFileId, folderId],
    queryFn: async () => {
      if (!videoFileId) {
        throw new Error('videoFileId is required');
      }
      return fetchVideoComments(videoFileId, folderId);
    },
    enabled: !!videoFileId, // videoFileId がない場合はクエリを実行しない
    staleTime: 1000 * 60 * 5, // 5分でスタイル
    gcTime: 1000 * 60 * 30, // 30分でガベージコレクション
    retry: 2, // 2回までリトライ
    ...options,
  });
}
