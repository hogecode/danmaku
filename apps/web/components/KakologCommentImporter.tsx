'use client';

import { useState } from 'react';
import { useKakologComments } from '@/hooks/useKakologComments';
import type { KakologCommentDto } from '@/lib/generated/models';

interface KakologCommentImporterProps {
  onCommentsImported: (comments: KakologCommentDto[], mergeMode: boolean) => void;
  isDisabled?: boolean;
}

/**
 * Kakolog (ニコ実実況ログ) コメントインポーター
 * チャンネル、開始時間、終了時間を指定 → API呼び出し → コメント取得 → DPlayer に注入
 */
export function KakologCommentImporter({
  onCommentsImported,
  isDisabled = false,
}: KakologCommentImporterProps) {
  const [channelId, setChannelId] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [mergeMode, setMergeMode] = useState(false); // false = 置き換え, true = マージ
  const { mutate, isPending, error } = useKakologComments();

  /**
   * ISO 8601 形式の日時文字列を Unix timestamp に変換
   * @param dateTimeStr ISO 8601 形式の文字列（例: "2026-09-28T14:30"）
   * @returns Unix timestamp（秒）
   */
  const convertToUnixTimestamp = (dateTimeStr: string): number => {
    const date = new Date(dateTimeStr);
    return Math.floor(date.getTime() / 1000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーション
    if (!channelId.trim()) {
      return;
    }

    if (!startDateTime || !endDateTime) {
      return;
    }

    const startTime = convertToUnixTimestamp(startDateTime);
    const endTime = convertToUnixTimestamp(endDateTime);

    // 開始時刻が終了時刻より後でないかチェック
    if (startTime >= endTime) {
      return;
    }

    mutate(
      { channelId: channelId.trim(), startTime, endTime },
      {
        onSuccess: (response) => {
          // レスポンスからコメントを直接使用
          const comments = response.comments || [];

          onCommentsImported(comments, mergeMode);

          // フォームをリセット
          setChannelId('');
          setStartDateTime('');
          setEndDateTime('');
        },
      }
    );
  };

  // バリデーション状態
  const isFormValid =
    channelId.trim() &&
    startDateTime &&
    endDateTime &&
    convertToUnixTimestamp(startDateTime) < convertToUnixTimestamp(endDateTime);

  return (
    <div className="bg-gray-700 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-bold mb-4">📺 Kakolog（過去ログ）コメント インポート</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* チャンネルID入力 */}
        <div>
          <label htmlFor="channelId" className="block text-sm font-medium mb-2">
            チャンネルID
            <span className="text-xs text-gray-400 ml-2">(例: jk1, jk2, jk3)</span>
          </label>
          <input
            id="channelId"
            type="text"
            placeholder="jk1"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            disabled={isPending || isDisabled}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* 開始日時入力 */}
        <div>
          <label htmlFor="startDateTime" className="block text-sm font-medium mb-2">
            開始日時
          </label>
          <input
            id="startDateTime"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            disabled={isPending || isDisabled}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* 終了日時入力 */}
        <div>
          <label htmlFor="endDateTime" className="block text-sm font-medium mb-2">
            終了日時
          </label>
          <input
            id="endDateTime"
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            disabled={isPending || isDisabled}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
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
          disabled={!isFormValid || isPending || isDisabled}
          className={`w-full py-2 rounded font-medium transition ${
            !isFormValid || isPending || isDisabled
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
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
          <p className="mb-2">
            ℹ️ Jikkyo APIから2ch実況ログのコメントをインポートできます
          </p>
          <p className="text-blue-300">
            対応チャンネル: jk1, jk2, jk3, jk4, jk5, jk6, jk7, jk8, jk9, jk10（JP地上波）など
          </p>
        </div>
      </form>
    </div>
  );
}
