import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // パフォーマンス監視のサンプリングレート
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // 分散トレーシングのターゲット URL
  tracePropagationTargets: ["localhost", /^\//],

  // Replay サンプリングレート
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 環境設定
  environment: process.env.NODE_ENV,

  // エラーハンドラー設定
  beforeSend(event, hint) {
    // 開発環境では全てのエラーを送信
    if (process.env.NODE_ENV === "development") {
      return event;
    }

    // 本番環境では特定のエラーを除外
    if (event.exception) {
      const error = hint.originalException;

      // ネットワークエラーを除外（ユーザーネットワークの問題の可能性）
      if (
        error instanceof Error &&
        error.message.includes("Network") 
      ) {
        return null;
      }

      // 特定のクライアント側エラーを除外
      if (
        error instanceof Error &&
        error.message.includes("ResizeObserver loop limit exceeded")
      ) {
        return null;
      }
    }

    return event;
  },

  // デバッグ情報の詳細度
  debug: process.env.NODE_ENV === "development",

  // Sentry が無効な場合に送信を試みない
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ユーザーのプライベート情報を除外
  denyUrls: [
    // ブラウザ拡張機能
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],

  // ソースマップの設定
  attachStacktrace: true,
  maxBreadcrumbs: 50,
});
