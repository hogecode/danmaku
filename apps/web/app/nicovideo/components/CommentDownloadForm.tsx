'use client';

import { useState } from 'react';
import axios from 'axios';

interface CommentDownloadFormProps {
  onDownloadStart: (taskId: string, videoId: string) => void;
}

export function CommentDownloadForm({ onDownloadStart }: CommentDownloadFormProps) {
  const [videoId, setVideoId] = useState('');
  const [commentsLimit, setCommentsLimit] = useState(1000);
  const [commentsFrom, setCommentsFrom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!videoId.trim()) {
        throw new Error('動画IDを入力してください');
      }

      const payload: any = {
        videoId: videoId.trim(),
        commentsLimit: parseInt(String(commentsLimit), 10),
      };

      if (commentsFrom) {
        payload.commentsFrom = new Date(commentsFrom).getTime() / 1000;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.post(
        `${apiUrl}/api/nicovideo/download/comments`,
        payload,
        { withCredentials: true }
      );

      if (response.data.taskId) {
        onDownloadStart(response.data.taskId, videoId);
        setVideoId('');
        setCommentsFrom('');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 
        err.response?.data?.error ||
        err.message || 
        'ダウンロード開始に失敗しました';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">コメントダウンロード</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            動画ID（例: sm12345678）
          </label>
          <input
            type="text"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="sm12345678"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            最大コメント数
          </label>
          <input
            type="number"
            value={commentsLimit}
            onChange={(e) => setCommentsLimit(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="10000"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            取得開始日時（オプション）
          </label>
          <input
            type="datetime-local"
            value={commentsFrom}
            onChange={(e) => setCommentsFrom(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-gray-400 text-xs mt-1">
            指定した日時以降のコメントを取得します（指定なしの場合は最新から遡ります）
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded transition-colors"
        >
          {loading ? 'ダウンロード中...' : 'ダウンロード開始'}
        </button>
      </form>

      <p className="text-gray-400 text-xs mt-4">
        ℹ️ コメント数が多い場合、処理に時間がかかることがあります
      </p>
    </div>
  );
}
