'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useAppSelector } from '@/lib/store/hooks';
import { selectSelectedConnectionId } from '@/lib/store/selectors';
import { useUserSettingsQuery } from '@/hooks/useUserSettings';

export default function WatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  // ✅ Redux ストアから選択中のドライブ接続ID を取得
  const connectionId = useAppSelector(selectSelectedConnectionId);
  
  // ✅ ユーザー設定を取得
  const { data: userSettings, isLoading: settingsLoading } = useUserSettingsQuery();
  
  // ✅ useSearchParams() で query parameters を取得
  const fileId = searchParams.get('fileId');
  const folderId = searchParams.get('folderId') || undefined;

  // ✅ ユーザー設定からコメント設定を構築
  const commentSettings = userSettings ? {
    speedRate: 1, // デフォルト値
    fontSize: 25, // デフォルト値
    opacity: parseFloat(userSettings.danmaku_opacity || '0.7'),
    maxCount: userSettings.danmaku_max_count || 100,
    displayDuration: userSettings.danmaku_display_duration || 5,
    closeFormAfterSend: false,
  } : {
    speedRate: 1,
    fontSize: 25,
    opacity: 0.7,
    maxCount: 100,
    displayDuration: 5,
    closeFormAfterSend: false,
  };

  // ✅ ユーザー設定からプレイヤー設定を構築
  const playerSettings = userSettings ? {
    theme: userSettings.theme || '#E64F97',
    autoplay: true,
    playbackSpeed: parseFloat(userSettings.playback_speed || '1'),
  } : {
    theme: '#E64F97',
    autoplay: true,
    playbackSpeed: 1,
  };

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

  if (!connectionId) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">ドライブが選択されていません</h1>
          <p className="text-gray-400">ドライブを選択してから動画を再生してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
          {settingsLoading ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin mb-3">⏳</div>
                <p>設定を読込中...</p>
              </div>
            </div>
          ) : (
            <VideoPlayer
              videoFileId={fileId}
              folderId={folderId}
              connectionId={connectionId}
              containerClassName="w-full aspect-video bg-black"
              commentSettings={commentSettings}
              playerSettings={playerSettings}
            />
          )}
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ファイル情報</h2>
          <p className="text-sm">ID: {fileId}</p>
          <p className="text-sm text-gray-400 mt-2">
            ※ ダンマク設定については [設定] ページから変更できます
          </p>
        </div>
      </div>
    </div>
  );
}
