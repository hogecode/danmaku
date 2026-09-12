/**
 * OpenAPI クライアント設定ヘルパー
 * トークン自動付与とエラーハンドリング
 */

import { Configuration } from '@/generated';
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants';
import { appLogger } from '@/utils/logger';
import { useAuthStore } from '@/stores/auth-store';

/**
 * カスタム Fetch 関数
 * トークンを自動的に付与し、エラーハンドリングを行う
 * @param token - ドライブ固有のアクセストークン（省略時は auth-store から取得）
 */
export const createFetchWithAuth = (token?: string, fetchFn?: typeof fetch) => {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const finalOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'react-native',
        ...options?.headers,
      },
    };

    // トークンを取得して付与
    try {
      // 引数で指定されたトークンを優先、なければ auth-store から取得
      const accessToken = token || useAuthStore.getState().token;
      if (accessToken) {
        finalOptions.headers = {
          ...finalOptions.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      } else {
        appLogger.warning('No token available for API request');
      }
    } catch (error) {
      appLogger.error('Failed to get token for API request', error);
    }

    // タイムアウト実装
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      appLogger.debug('API request timeout');
      controller.abort();
    }, API_TIMEOUT);

    try {
      const response = await (fetchFn || fetch)(url, {
        ...finalOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        appLogger.error(`API error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        appLogger.error('API request aborted (timeout)');
      } else {
        appLogger.error('API request failed', error);
      }
      throw error;
    }
  };
};

/**
 * OpenAPI Configuration を作成
 * @param token - ドライブ固有のアクセストークン（オプション）
 */
export const createApiConfiguration = (token?: string): Configuration => {
  return new Configuration({
    basePath: API_BASE_URL,
    fetchApi: createFetchWithAuth(token),
  });
};
