/**
 * ニコ動コメント取得 Hook
 * 動画ID を指定してコメントを取得
 */

import { useMutation } from '@tanstack/react-query';
import { NicovideoApi, Configuration } from '@/lib/generated';
import type { DownloadCommentWithDPlayerResponseDto } from '@/lib/generated/models';

/**
 * NicovideoApi インスタンスを作成
 */
function createNicovideoApi(): NicovideoApi {
  const configuration = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    baseOptions: {
      withCredentials: true,
    },
  });
  return new NicovideoApi(configuration);
}

/**
 * useNicovideoComments
 * ニコ動動画ID からコメントを取得する mutation
 */
export function useNicovideoComments() {
  const nicovideoApi = createNicovideoApi();

  return useMutation<DownloadCommentWithDPlayerResponseDto, Error, { videoId: string }>({
    mutationFn: async ({ videoId }) => {
      const response = await nicovideoApi.nicovideoControllerDownloadComments({
        videoId,
      });
      
      return response.data as DownloadCommentWithDPlayerResponseDto;
    },
  });
}
