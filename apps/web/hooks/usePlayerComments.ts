/**
 * プレイヤーコメント取得 Hook
 * TanStack Query でラップされたコメント取得
 */

import { useQuery } from '@tanstack/react-query';
import { PlayerApi, Configuration } from '@/lib/generated';
import type { DPlayerCommentDto } from '@/lib/generated';

/**
 * PlayerApi インスタンスを作成
 */
function createPlayerApi(): PlayerApi {
  const configuration = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    baseOptions: {
      withCredentials: true,
    },
  });
  return new PlayerApi(configuration);
}

/**
 * usePlayerComments
 * 
 * DPlayer 互換形式のコメントを TanStack Query で取得
 * 
 * @param videoFileId - 動画ファイル ID
 * @param folderId - フォルダ ID
 * @param connectionId - 接続 ID
 * @param options - useQuery オプション
 * @returns useQuery 結果
 * 
 * @example
 * const { data, isLoading, error } = usePlayerComments(videoFileId, folderId, connectionId);
 */
export function usePlayerComments(
  videoFileId?: string,
  folderId?: string,
  connectionId?: string,
  options = {},
) {
  const playerApi = createPlayerApi();
  
  return useQuery({
    queryKey: ['playerComments', videoFileId, folderId, connectionId],
    queryFn: async () => {
      if (!videoFileId) {
        throw new Error('videoFileId is required');
      }
      if (!folderId) {
        throw new Error('folderId is required');
      }
      if (!connectionId) {
        throw new Error('connectionId is required');
      }
      const response = await playerApi.playerControllerGetComments(videoFileId, folderId, connectionId);
      return response.data.comments || [];
    },
    enabled: !!videoFileId && !!folderId && !!connectionId, // すべてのパラメータが必要
    staleTime: 1000 * 60 * 5, // 5分でスタイル
    gcTime: 1000 * 60 * 30, // 30分でガベージコレクション
    retry: 2, // 2回までリトライ
    ...options,
  });
}
