'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';

/**
 * ホーム画面
 * 認証が必須なページ
 */
export default function HomePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuthContext();

  // 未認証の場合はログインページへリダイレクト
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin">
          <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12"></div>
        </div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Danmaku</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ユーザープロフィールカード */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-4">
              <div className="text-center">
                {user.picture_url && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={user.picture_url}
                      alt={user.name || 'User'}
                      className="w-24 h-24 rounded-full border-4 border-blue-500"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.name || 'ユーザー'}
                </h2>
                <p className="text-gray-600 text-sm mb-4">{user.email}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">プロバイダー</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {user.oauth_provider}
                  </p>
                </div>

                {user.last_login && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-2">最終ログイン</p>
                    <p className="text-sm text-gray-900">
                      {new Date(user.last_login).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* メインコンテンツ領域 */}
          <div className="md:col-span-2 space-y-8">
            {/* ウェルカムカード */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ようこそ、{user.name || 'ユーザー'}さん！
              </h2>
              <p className="text-gray-600 mb-4">
                Danmaku はリアルタイムコメント配信プラットフォームです。
                ライブストリーミングやイベントで、視聴者からのコメントをリアルタイムで
                画面上に表示できます。
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-blue-900">
                  💡 ヒント: サイドバーのメニューから、配信設定やコメント管理ページにアクセスできます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2026 Danmaku All rights reserved.</p>
            <p className="mt-2">
              API: <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_API_BASE_URL}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
