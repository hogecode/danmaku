'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

/**
 * OAuth コールバック処理ページ
 * Google OAuth 認証後にリダイレクトされるページ
 */
export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // エラーパラメータをチェック
        const errorParam = searchParams.get('error');
        if (errorParam) {
          const errorDescription = searchParams.get('error_description');
          throw new Error(
            `Authorization failed: ${errorDescription || errorParam}`
          );
        }

        // コードとstate を取得
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          throw new Error('Missing code or state parameter');
        }

        // バックエンドの callback エンドポイントに正式なリクエストを送る
        // これによってセッションが確立される
        const response = await apiClient.get(`/auth/callback`, {
          params: {
            code,
            state,
          },
        });

        console.log('Callback successful:', response.data);

        // ホームページにリダイレクト
        router.push('/home');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
        console.error('Callback error:', err);
        setProcessing(false);

        // 3秒後にログインページに戻す
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
        {processing ? (
          <>
            <div className="animate-spin mb-4">
              <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 mx-auto"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ログイン処理中...
            </h2>
            <p className="text-gray-600">
              Google アカウントで認証を処理しています
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 text-red-500">
              <svg
                className="w-12 h-12 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ログインエラー
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 text-sm">
              3秒後にログインページに戻ります...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
