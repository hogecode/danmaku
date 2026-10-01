import * as Sentry from "@sentry/nextjs";

// Automatically instrumented by the Sentry Next.js SDK
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
}

// App Routerのエラーキャッチフック
// エラーが発生した際にSentryに通知するためのフック
export const onRequestError = Sentry.captureRequestError;