/**
 * Kakolog (2ch実況ログ) コメント取得 Hook
 * チャンネル、開始時間、終了時間を指定してコメントを取得
 */

import { useMutation } from '@tanstack/react-query';
import { KakologApi, Configuration } from '@/lib/generated';
import type { GetKakologCommentsResponseDto } from '@/lib/generated/models';

/**
 * KakologApi インスタンスを作成
 */
function createKakologApi(): KakologApi {
  const configuration = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    baseOptions: {
      withCredentials: true,
    },
  });
  return new KakologApi(configuration);
}

export interface UseKakologCommentsParams {
  channelId: string;
  startTime: number;
  endTime: number;
}

/**
 * useKakologComments
 * チャンネル、開始時間、終了時間からコメントを取得する mutation
 */
export function useKakologComments() {
  const kakologApi = createKakologApi();

  return useMutation<GetKakologCommentsResponseDto, Error, UseKakologCommentsParams>({
    mutationFn: async ({ channelId, startTime, endTime }) => {
      const response = await kakologApi.kakologControllerDownloadComments({
        channelId,
        startTime,
        endTime,
      });

      return response.data as GetKakologCommentsResponseDto;
    },
  });
}
