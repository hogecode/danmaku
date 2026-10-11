import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  // 開発環境では 0.0 に設定してトレーシングを無効化
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,

  // デバッグモード無効化
  debug: false,

  environment: process.env.NODE_ENV,
});
