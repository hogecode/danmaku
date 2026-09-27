'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { VideoPlayer } from '@/components/VideoPlayer';
import type { VideoPlayerHandle } from '@/components/VideoPlayer';
import { CommentImporterModal } from '@/components/CommentImporterModal';
import { useAppSelector } from '@/lib/store/hooks';
import { selectSelectedConnectionId } from '@/lib/store/selectors';
import { useUserSettingsQuery } from '@/hooks/useUserSettings';
import type { DPlayerCommentDto } from '@/lib/generated';
import Image from 'next/image';

/**
 * コメント重複排除
 * なぜか、ニコ動のコメントを取得すると、重複してコメントが含まれることがあるため
 * time と text が同一のコメントを除外
 */
function deduplicateComments(comments: DPlayerCommentDto[]): DPlayerCommentDto[] {
  const seen = new Set<string>();
  const result: DPlayerCommentDto[] = [];

  for (const comment of comments) {
    // time と text を組み合わせてキーを生成
    const key = `${comment.time}:${comment.text}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(comment);
    }
  }

  return result;
}

export default function WatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  
  // ✅ Redux ストアから選択中のドライブ接続ID を取得
  const connectionId = useAppSelector(selectSelectedConnectionId);
  
  // ✅ ユーザー設定を取得
  const { data: userSettings, isLoading: settingsLoading } = useUserSettingsQuery();
  
  // ✅ useSearchParams() で query parameters を取得
  const fileId = searchParams.get('fileId');
  const folderId = searchParams.get('folderId') || undefined;

  // ✅ ニコ動コメント状態
  const [nicovideoComments, setNicovideoComments] = useState<DPlayerCommentDto[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  
  // ✅ モーダル状態
  const [isCommentImporterModalOpen, setIsCommentImporterModalOpen] = useState(false);



  /**
   * コメントをインポート
   * 
   * ニコ動 / 過去ログの両方で使用
   * initialComments prop を変更すると、VideoPlayer が自動的に
   * DPlayer を再初期化してコメントをリロードする
   */
  const handleCommentsImported = (
    comments: DPlayerCommentDto[],
    mergeMode: boolean
  ) => {
    // コメント状態を更新 → VideoPlayer に渡される initialComments が変更される
    const mergedComments = mergeMode 
      ? [...nicovideoComments, ...comments]
      : comments;

    // ✅ 重複コメントを排除
    const dedupedComments = deduplicateComments(mergedComments);
    
    setNicovideoComments(dedupedComments);
    setImportSuccess(true);

    setTimeout(() => {
      setImportSuccess(false);
    }, 3000);
  };

  const commentSettings = userSettings ? {
    speedRate: 1,
    fontSize: 25,
    opacity: 0.7,
    maxCount: userSettings.danmaku_max_count || 100,
    displayDuration: 5,
    closeFormAfterSend: false,
  } : {
    speedRate: 1,
    fontSize: 25,
    opacity: 0.7,
    maxCount: 100,
    displayDuration: 5,
    closeFormAfterSend: false,
  };

  const playerSettings = userSettings ? {
    theme: userSettings.theme || '#E64F97',
    autoplay: true,
  } : {
    theme: '#E64F97',
    autoplay: true,
  };

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
              ref={videoPlayerRef}
              videoFileId={fileId}
              folderId={folderId}
              connectionId={connectionId}
              containerClassName="w-full aspect-video bg-black"
              initialComments={nicovideoComments}
              commentSettings={commentSettings}
              playerSettings={playerSettings}
            />
          )}
        </div>

        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">ℹ️ ファイル情報</h2>
          <p className="text-sm">ID: {fileId}</p>
          <p className="text-sm text-gray-400 mt-2">
            ※ ダンマク設定については [設定] ページから変更できます
          </p>
        </div>

        {/* ニコニコロゴをクリックしてモーダルを表示 */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsCommentImporterModalOpen(true)}
            className="p-3 hover:opacity-80 transition"
            title="コメント インポーター"
          >
            <Image
              src="/photos/logo/niconico.png"
              alt="ニコニコ動画"
              width={30}
              height={30}
              className="cursor-pointer"
            />
          </button>
        </div>

        {/* コメント インポーター モーダル */}
        <CommentImporterModal
          isOpen={isCommentImporterModalOpen}
          onClose={() => setIsCommentImporterModalOpen(false)}
          onCommentsImported={handleCommentsImported}
          isDisabled={settingsLoading}
        />

        {importSuccess && (
          <div className="mt-4 bg-green-900 border border-green-600 rounded-lg p-4 text-green-200">
            <p className="font-bold">✅ コメント取得成功</p>
            <p className="text-sm mt-1">{nicovideoComments.length} 件のコメントをインポートしました</p>
          </div>
        )}
      </div>
    </div>
  );
}
