'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { VideoPlayer } from '@/components/VideoPlayer';

export default function WatchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const params = use(searchParams);
  const fileId = Array.isArray(params.fileId)
    ? params.fileId[0]
    : params.fileId;
  const folderId = Array.isArray(params.folderId)
    ? params.folderId[0]
    : params.folderId;

  const [commentSettings, setCommentSettings] = useState({
    speedRate: 1,
    fontSize: 25,
  });

  const [playerSettings, setPlayerSettings] = useState({
    theme: '#E64F97',
    autoplay: true,
  });

  // 未認証の場合はログインページへリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 認証中
  if (authLoading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin mb-3">⏳</div>
          <p>認証中...</p>
        </div>
      </div>
    );
  }

  // 未認証
  if (!isAuthenticated) {
    return null;
  }

  if (!fileId) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">ファイルが指定されていません</h1>
          <p className="text-gray-400">/watch?fileId=abc123def456</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
          <VideoPlayer
            videoFileId={fileId}
            folderId={folderId}
            containerClassName="w-full aspect-video bg-black"
            commentSettings={commentSettings}
            playerSettings={playerSettings}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">コメント設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  コメント速度: {commentSettings.speedRate.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="2"
                  step="0.25"
                  value={commentSettings.speedRate}
                  onChange={(e) =>
                    setCommentSettings({
                      ...commentSettings,
                      speedRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  フォントサイズ: {commentSettings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  step="2"
                  value={commentSettings.fontSize}
                  onChange={(e) =>
                    setCommentSettings({
                      ...commentSettings,
                      fontSize: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">プレイヤー設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">テーマカラー</label>
                <div className="flex gap-2">
                  {['#E64F97', '#00A0FF', '#FF5722', '#4CAF50'].map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setPlayerSettings({
                          ...playerSettings,
                          theme: color,
                        })
                      }
                      className={`w-8 h-8 rounded border-2 ${
                        playerSettings.theme === color
                          ? 'border-white'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={playerSettings.autoplay}
                  onChange={(e) =>
                    setPlayerSettings({
                      ...playerSettings,
                      autoplay: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span className="ml-2 text-sm">自動再生</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ファイル情報</h2>
          <p className="text-sm">ID: {fileId}</p>
        </div>
      </div>
    </div>
  );
}
