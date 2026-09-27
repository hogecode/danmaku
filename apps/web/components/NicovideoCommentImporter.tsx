'use client';

import { useState } from 'react';
import { useNicovideoComments } from '@/hooks/useNicovideoComments';
import type { DPlayerCommentDto } from '@/lib/generated/models';

interface NicovideoCommentImporterProps {
  onCommentsImported: (comments: DPlayerCommentDto[], mergeMode: boolean) => void;
  isDisabled?: boolean;
  isModalContent?: boolean; // モーダル内での表示かどうか（スタイル調整用）
}

/**
 * ニコ動コメントインポーター
 * ニコ動動画ID入力 → API 呼び出し → コメント取得 → DPlayer に注入
 */
export function NicovideoCommentImporter({
  onCommentsImported,
  isDisabled = false,
  isModalContent = false,
}: NicovideoCommentImporterProps) {
  const [videoId, setVideoId] = useState('');
  const [mergeMode, setMergeMode] = useState(false); // false = 置き換え, true = マージ
  const { mutate, isPending, error } = useNicovideoComments();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!videoId.trim()) {
      return;
    }

    mutate(
      { videoId: videoId.trim() },
      {
        onSuccess: (response) => {
          // レスポンスからコメントを抽出
          const allComments: DPlayerCommentDto[] = [];

          if (response.comments?.threads) {
            response.comments.threads.forEach((thread) => {
              if (thread.comments && Array.isArray(thread.comments)) {
                allComments.push(...(thread.comments as DPlayerCommentDto[]));
              }
            });
          }

          onCommentsImported(allComments, mergeMode);
          setVideoId(''); // フォームをリセット
        },
      }
    );
  };

  return (
    <div className={isModalContent ? "" : "bg-gray-700 rounded-lg p-6 mt-6"}>
      {!isModalContent && <h3 className="text-lg font-bold mb-4">🎬 ニコ動コメント インポート</h3>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 動画ID入力 */}
        <div>
          <label htmlFor="nicoVideoId" className="block text-sm font-medium mb-2">
            動画ID
            <span className="text-xs text-gray-400 ml-2">(例: sm12345678)</span>
          </label>
          <input
            id="nicoVideoId"
            type="text"
            placeholder="sm12345678"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            disabled={isPending || isDisabled}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 disabled:opacity-50"
          />
        </div>

        {/* マージモード切り替え */}
        <div className="flex items-center space-x-3 bg-gray-600 rounded p-3">
          <input
            id="mergeMode"
            type="checkbox"
            checked={mergeMode}
            onChange={(e) => setMergeMode(e.target.checked)}
            disabled={isPending || isDisabled}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="mergeMode" className="text-sm cursor-pointer flex-1">
            既存コメントに<span className="font-bold">追加</span>
            <span className="text-xs text-gray-300 ml-2">
              (チェック無し = 置き換え)
            </span>
          </label>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={!videoId.trim() || isPending || isDisabled}
          className={`w-full py-2 rounded font-medium transition ${
            !videoId.trim() || isPending || isDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              コメント取得中...
            </span>
          ) : (
            'コメント取得'
          )}
        </button>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-900 border border-red-600 rounded p-3 text-sm text-red-200">
            <p className="font-bold mb-1">❌ エラー</p>
            <p>{error.message}</p>
          </div>
        )}

        {/* 情報メッセージ */}
        <div className="bg-blue-900 border border-blue-600 rounded p-3 text-xs text-blue-200">
          <p>
            ℹ️ ニコ動の動画ID (sm/nm で始まる) を入力して、コメントをインポートできます
          </p>
        </div>
      </form>
    </div>
  );
}
