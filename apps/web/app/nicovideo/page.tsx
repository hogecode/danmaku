'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import {
  NicovideLoginForm,
  VideoDownloadForm,
  CommentDownloadForm,
  DownloadStatus,
} from './components';

export default function NicovideDownloadPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const [isNicovideLoggedIn, setIsNicovideLoggedIn] = useState(true);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'comments'>('video');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin mb-3 text-2xl">⏳</div>
          <p>認証中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">ニコニコ動画 ダウンロード</h1>
        <p className="text-gray-400 mb-8">
          動画とコメントを簡単にダウンロードできます
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!isNicovideLoggedIn ? (
              <>
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-200 font-medium mb-2">
                    ⚠️ 注意: Google ログインが必須です
                  </p>
                  <p className="text-red-300 text-sm">
                    このページを使用する前に、上部のナビゲーションから Google アカウントでログインしてください。
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    ✓ Google ログイン完了後、ニコ動アカウント情報を入力してください
                  </p>
                </div>
                <NicovideLoginForm
                  onLoginSuccess={() => setIsNicovideLoggedIn(true)}
                />
              </>
            ) : (
              <>
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 flex justify-between items-center">
                  <p className="text-green-200">✓ ニコ動ログイン完了</p>
                  <button
                    onClick={() => setIsNicovideLoggedIn(false)}
                    className="text-green-200 text-sm underline"
                  >
                    ログアウト
                  </button>
                </div>

                <div className="flex gap-2 border-b border-gray-700">
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-4 py-2 ${activeTab === 'video' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
                  >
                    🎬 動画
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-2 ${activeTab === 'comments' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                  >
                    💬 コメント
                  </button>
                </div>

                {activeTab === 'video' && (
                  <VideoDownloadForm
                    onDownloadStart={(id, vid) => setCurrentTask({ taskId: id, videoId: vid })}
                  />
                )}
                {activeTab === 'comments' && (
                  <CommentDownloadForm
                    onDownloadStart={(id, vid) => setCurrentTask({ taskId: id, videoId: vid })}
                  />
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            {user && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="font-bold mb-3">👤 ユーザー</h3>
                <p className="text-gray-300 text-sm">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentTask && (
        <DownloadStatus
          taskId={currentTask.taskId}
          videoId={currentTask.videoId}
          onClose={() => setCurrentTask(null)}
        />
      )}
    </div>
  );
}
