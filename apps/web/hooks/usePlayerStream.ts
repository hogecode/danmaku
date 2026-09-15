/**
 * 動画ストリーミング取得 Hook
 * OpenAPI自動生成クライアントを使用したビデオストリーミング
 */

import { useQuery } from '@tanstack/react-query';
import { PlayerApi, Configuration } from '@/lib/generated';

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
 * usePlayerStream
 * 
 * OpenAPI自動生成クライアント経由でビデオストリームを取得
 * DPlayer用のURL直接ストリーミングではなく、
 * APIメソッドの検証用
 */
export function usePlayerStream(
  connectionId?: string,
  fileId?: string,
  range?: string,
  options = {},
) {
  const playerApi = createPlayerApi();
  
  return useQuery({
    queryKey: ['playerStream', connectionId, fileId, range],
    queryFn: async () => {
      if (!connectionId) {
        throw new Error('connectionId is required');
      }
      if (!fileId) {
        throw new Error('fileId is required');
      }
      
      // OpenAPI生成クライアントを使用してストリーミングを取得
      // Note: このメソッドはバイナリレスポンスを返すため、
      // DPlayerの直接URL使用が必要な場合は別アプローチが必要
      const response = await playerApi.playerControllerStreamVideo(
        connectionId,
        fileId,
        range || '',
      );
      return response.data;
    },
    enabled: !!connectionId && !!fileId,
    staleTime: 0, // ストリーミングなのでキャッシュなし
    gcTime: 1000 * 60, // 1分でガベージコレクション
    retry: 1, // ストリーミングは1回だけリトライ
    ...options,
  });
}
