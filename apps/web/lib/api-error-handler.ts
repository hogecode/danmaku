import {
  captureApiError,
  getUserFriendlyMessage,
  addSentryBreadcrumb,
} from "./sentry-utils";

/**
 * API レスポンスのエラーハンドリング
 * 
 * 使用例:
 * ```typescript
 * try {
 *   const response = await fetch('/api/users');
 *   await handleApiResponse(response, '/api/users');
 * } catch (error) {
 *   handleApiError(error, '/api/users');
 * }
 * ```
 */

/**
 * API レスポンスをハンドルする
 * 
 * @param response - Fetch レスポンスオブジェクト
 * @param endpoint - API エンドポイント
 * @returns パースされた JSON データ
 * @throws エラーがある場合は例外をスロー
 */
export async function handleApiResponse<T>(
  response: Response,
  endpoint: string
): Promise<T> {
  // ブレッドクラムを追加
  addSentryBreadcrumb(
    `API Call: ${response.status} ${endpoint}`,
    "api",
    response.ok ? "info" : "error",
    {
      status: response.status,
      endpoint,
    }
  );

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || "Unknown error",
      };
    }

    const error = new Error(
      errorData.message ||
        errorData.error ||
        `API Error: ${response.status}`
    );

    captureApiError(error, endpoint, response.status, {
      responseData: errorData,
    });

    throw new ApiError(
      getUserFriendlyMessage(error, "api_error"),
      response.status,
      errorData
    );
  }

  try {
    const data: T = await response.json();
    return data;
  } catch (error) {
    const parseError = new Error(
      "Failed to parse API response: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
    captureApiError(parseError, endpoint, response.status, {
      responseBody: await response.text(),
    });

    throw new ApiError(
      "サーバーからのレスポンスが不正です。",
      response.status
    );
  }
}

/**
 * API エラーをハンドルする
 * 
 * @param error - キャッチしたエラー
 * @param endpoint - API エンドポイント
 * @param context - 追加コンテキスト
 */
export function handleApiError(
  error: Error | unknown,
  endpoint: string,
  context?: Record<string, any>
): never {
  const errorObj =
    error instanceof Error ? error : new Error(String(error));

  // ネットワークエラーの判定
  if (errorObj.message.includes("fetch") || errorObj.message.includes("Network")) {
    captureApiError(errorObj, endpoint, undefined, {
      type: "network_error",
      ...context,
    });

    throw new ApiError(
      "ネットワークエラーが発生しました。接続を確認してください。",
      0
    );
  }

  // その他のエラー
  captureApiError(errorObj, endpoint, undefined, context);

  throw new ApiError(
    getUserFriendlyMessage(errorObj, "api_error"),
    0
  );
}

/**
 * API エラークラス
 */
export class ApiError extends Error {
  constructor(
    public userMessage: string,
    public statusCode: number = 0,
    public rawError?: Record<string, any>
  ) {
    super(userMessage);
    this.name = "ApiError";
  }
}

/**
 * Try-Catch ラッパー（async/await 用）
 * 
 * 使用例:
 * ```typescript
 * const data = await tryCatch(
 *   fetch('/api/users').then(r => handleApiResponse(r, '/api/users')),
 *   '/api/users'
 * );
 * ```
 */
export async function tryCatch<T>(
  promise: Promise<T>,
  endpoint?: string
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (endpoint) {
      handleApiError(error, endpoint);
    }
    throw error;
  }
}
