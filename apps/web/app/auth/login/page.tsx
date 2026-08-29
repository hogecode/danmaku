'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

/**
 * ログイン画面
 */
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading, startLogin } = useAuthContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // マウント時の初期化
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // すでに認証されていたらホームへリダイレクト
  useEffect(() => {
    // useAuthContextがマウントされる前に実行されるのを防ぐため、isMountedをチェック
    if (!isMounted) return;
    if (isAuthenticated && !loading) {
      router.push('/home');
    }
  }, [isMounted, isAuthenticated, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(true);
      await startLogin();
    } catch (error) {
      console.error('Login error:', error);
      setLoginLoading(false);
    }
  };

  // ハイドレーション完了またはローディング中の場合
  if (!isMounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin">
          <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12"></div>
        </div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danmaku</h1>
          <p className="text-gray-600">リアルタイムコメント配信プラットフォーム</p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-gray-600 text-sm mb-6">
            Google アカウントでログインしてください
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loginLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.382 1.564a10.787 10.787 0 0110.787 10.787c0 5.955-4.832 10.787-10.787 10.787-5.954 0-10.787-4.832-10.787-10.787 0-5.954 4.833-10.787 10.787-10.787zm0 1.956c-4.865 0-8.831 3.966-8.831 8.831 0 4.866 3.966 8.831 8.831 8.831 4.866 0 8.831-3.965 8.831-8.831 0-4.865-3.965-8.831-8.831-8.831zm-4.364 5.277h1.956v3.912h-1.956v-3.912zm4.364-3.956a1.956 1.956 0 110 3.912 1.956 1.956 0 010-3.912zm0 1.956a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            {loginLoading ? 'リダイレクト中...' : 'Google でログイン'}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとします
          </p>
        </div>
      </div>

    </div>
  );
}
