import * as Sentry from "@sentry/nextjs";

/**
 * エラー種別の定義
 */
export type ErrorType =
  | "api_error"
  | "validation_error"
  | "auth_error"
  | "not_found_error"
  | "permission_error"
  | "network_error"
  | "unknown_error";

/**
 * エラーレベルの定義
 */
export type ErrorLevel = "fatal" | "error" | "warning" | "info";

/**
 * エラーコンテキスト
 */
interface ErrorContext {
  userId?: string;
  endpoint?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  statusCode?: number;
  [key: string]: any;
}

/**
 * Sentry にエラーを送信する統一関数
 * 
 * @param error - キャッチしたエラー
 * @param errorType - エラーの種類
 * @param context - 追加コンテキスト
 * @param level - エラーレベル
 */
export function captureError(
  error: Error | string,
  errorType: ErrorType = "unknown_error",
  context?: ErrorContext,
  level: ErrorLevel = "error"
) {
  const errorObj = typeof error === "string" ? new Error(error) : error;

  Sentry.captureException(errorObj, {
    level,
    tags: {
      errorType,
      environment: process.env.NODE_ENV,
    },
    contexts: {
      custom: context || {},
    },
  });

  // 開発環境ではコンソールにも出力
  if (process.env.NODE_ENV === "development") {
    console.error(`[${errorType}]`, errorObj, context);
  }
}

/**
 * API エラーをキャッチしてログに送信
 * 
 * @param error - エラーオブジェクト
 * @param endpoint - API エンドポイント
 * @param statusCode - HTTP ステータスコード
 * @param context - 追加コンテキスト
 */
export function captureApiError(
  error: Error | string,
  endpoint: string,
  statusCode?: number,
  context?: Omit<ErrorContext, "endpoint">
) {
  const errorType = getApiErrorType(statusCode);
  
  captureError(error, errorType, {
    endpoint,
    statusCode,
    ...context,
  });
}

/**
 * バリデーションエラーをキャッチしてログに送信
 * 
 * @param error - エラーオブジェクト
 * @param fieldName - フィールド名
 * @param context - 追加コンテキスト
 */
export function captureValidationError(
  error: Error | string,
  fieldName: string,
  context?: Omit<ErrorContext, "fieldName">
) {
  captureError(error, "validation_error", {
    fieldName,
    ...context,
  }, "warning");
}

/**
 * 認証エラーをキャッチしてログに送信
 * 
 * @param error - エラーオブジェクト
 * @param context - 追加コンテキスト
 */
export function captureAuthError(
  error: Error | string,
  context?: ErrorContext
) {
  captureError(error, "auth_error", context, "warning");
}

/**
 * ネットワークエラーをキャッチしてログに送信
 * 
 * @param error - エラーオブジェクト
 * @param endpoint - エンドポイント
 * @param context - 追加コンテキスト
 */
export function captureNetworkError(
  error: Error | string,
  endpoint: string,
  context?: Omit<ErrorContext, "endpoint">
) {
  captureError(error, "network_error", {
    endpoint,
    ...context,
  });
}

/**
 * 許可エラーをキャッチしてログに送信
 * 
 * @param error - エラーオブジェクト
 * @param resource - リソース名
 * @param context - 追加コンテキスト
 */
export function capturePermissionError(
  error: Error | string,
  resource: string,
  context?: Omit<ErrorContext, "resource">
) {
  captureError(error, "permission_error", {
    resource,
    ...context,
  }, "warning");
}

/**
 * ステータスコードからエラーの種類を判定
 * 
 * @param statusCode - HTTP ステータスコード
 * @returns エラーの種類
 */
function getApiErrorType(statusCode?: number): ErrorType {
  if (!statusCode) return "unknown_error";
  
  if (statusCode === 401) return "auth_error";
  if (statusCode === 403) return "permission_error";
  if (statusCode === 404) return "not_found_error";
  if (statusCode >= 400 && statusCode < 500) return "validation_error";
  
  return "api_error";
}

/**
 * エラーメッセージからユーザーフレンドリーなメッセージを生成
 * 
 * @param error - エラーオブジェクト
 * @param errorType - エラーの種類
 * @returns ユーザー向けメッセージ
 */
export function getUserFriendlyMessage(
  error: Error | string,
  errorType: ErrorType = "unknown_error"
): string {
  const messages: Record<ErrorType, string> = {
    api_error: "サーバーエラーが発生しました。しばらくしてからお試しください。",
    validation_error: "入力値が不正です。内容を確認して再度お試しください。",
    auth_error: "認証に失敗しました。ログインし直してください。",
    not_found_error: "リソースが見つかりません。",
    permission_error: "このリソースにアクセスする権限がありません。",
    network_error: "ネットワークエラーが発生しました。接続を確認してください。",
    unknown_error: "予期しないエラーが発生しました。",
  };

  return messages[errorType];
}

/**
 * Sentry にユーザーコンテキストを設定
 * 
 * @param userId - ユーザーID
 * @param email - メールアドレス
 * @param username - ユーザー名
 */
export function setSentryUser(
  userId: string,
  email?: string,
  username?: string
) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Sentry のユーザーコンテキストをクリア
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Sentry に追加のコンテキストを設定
 * 
 * @param name - コンテキスト名
 * @param data - コンテキストデータ
 */
export function setSentryContext(name: string, data: Record<string, any>) {
  Sentry.setContext(name, data);
}

/**
 * Sentry にブレッドクラムを追加
 * 
 * @param message - メッセージ
 * @param category - カテゴリー
 * @param level - レベル
 * @param data - 追加データ
 */
export function addSentryBreadcrumb(
  message: string,
  category: string = "custom",
  level: Sentry.SeverityLevel = "info",
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}
