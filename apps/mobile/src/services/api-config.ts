/**
 * OpenAPI クライアント設定ヘルパー
 * ✅ sessionId を自動付与し、エラーハンドリングを行う
 */

import { Configuration } from '@/generated';
import { API_BASE_URL, API_TIMEOUT } from '@/utils/constants';
import { appLogger } from '@/utils/logger';
import { useAuthStore } from '@/stores/auth-store';

/**
 * カスタム Fetch 関数
 * ✅ sessionId を X-Session-Id ヘッダーで自動付与
 * @param sessionId - セッション ID（省略時は auth-store から取得）
 */
export const createFetchWithAuth = (sessionId?: string, fetchFn?: typeof fetch) => {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const finalOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'react-native',
        ...options?.headers,
      },
    };

    // ✅ sessionId を取得して付与
    try {
      // 引数で指定された sessionId を優先、なければ auth-store から取得
      const currentSessionId = sessionId || useAuthStore.getState().sessionId;
      if (currentSessionId) {
        finalOptions.headers = {
          ...finalOptions.headers,
          'X-Session-Id': currentSessionId,
        };
        appLogger.debug(`[API] Using session ID: ${currentSessionId.substring(0, 8)}...`);
      } else {
        appLogger.warning('No session ID available for API request');
      }
    } catch (error) {
      appLogger.error('Failed to get session ID for API request', error);
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
 * ✅ sessionId を付与
 * @param sessionId - セッション ID（オプション）
 */
export const createApiConfiguration = (sessionId?: string): Configuration => {
  return new Configuration({
    basePath: API_BASE_URL,
    fetchApi: createFetchWithAuth(sessionId),
  });
};
