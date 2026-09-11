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
 */
export const createFetchWithAuth = (fetchFn?: typeof fetch) => {
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
      const token = useAuthStore.getState().token;
      if (token) {
        finalOptions.headers = {
          ...finalOptions.headers,
          Authorization: `Bearer ${token}`,
        };
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
 */
export const createApiConfiguration = (): Configuration => {
  return new Configuration({
    basePath: API_BASE_URL,
    fetchApi: createFetchWithAuth(),
  });
};
