/**
 * PlayerAPI クライアント（ラッパー）
 * 自動生成されたコードの使用を簡潔にするため
 */

import type { CommentListDto } from '@/lib/generated/models';
import { PlayerApi, Configuration } from '@/lib/generated';

/**
 * PlayerAPI クライアントシングルトン
 */
let playerApiInstance: PlayerApi | null = null;

/**
 * PlayerAPI インスタンスを取得
 */
export function getPlayerApiClient(): PlayerApi {
  if (!playerApiInstance) {
    const configuration = new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      baseOptions: {
        withCredentials: true, // クッキーを自動送信（セッション認証用）
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    playerApiInstance = new PlayerApi(configuration);
  }

  return playerApiInstance;
}

/**
 * 動画のコメントを取得
 * @param videoFileId - GDrive 動画ファイル ID
 * @param folderId - 動画ファイルが存在するフォルダID
 * @returns コメントデータ
 */
export async function fetchVideoComments(
  videoFileId: string,
  folderId?: string,
): Promise<CommentListDto> {
  try {
    const playerApi = getPlayerApiClient();
    // ✅ folderId をクエリパラメータで渡す
    const response = await playerApi.playerControllerGetComments(
      videoFileId,
      folderId || '',
    );
    return response.data as CommentListDto;
  } catch (error: any) {
    console.error('[PlayerClient] Failed to fetch comments:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
      config: {
        url: error?.config?.url,
        method: error?.config?.method,
      },
    });
    // エラーの場合は空配列を返す
    return { comments: [] };
  }
}

/**
 * 動画ストリーミング URL を生成
 * @param videoFileId - GDrive 動画ファイル ID
 * @returns ストリーミング URL
 */
export function generateVideoStreamUrl(videoFileId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${baseUrl}/api/player/stream/${videoFileId}`;
}
