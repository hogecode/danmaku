'use client';

import { useState } from 'react';
import axios from 'axios';

interface VideoDownloadFormProps {
  onDownloadStart: (taskId: string, videoId: string) => void;
}

export function VideoDownloadForm({ onDownloadStart }: VideoDownloadFormProps) {
  const [videoId, setVideoId] = useState('');
  const [quality, setQuality] = useState<'high' | 'low' | 'auto'>('auto');
  const [downloadComments, setDownloadComments] = useState(false);
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.post(
        `${apiUrl}/api/nicovideo/download/video`,
        {
          videoId: videoId.trim(),
          quality,
          downloadComments,
        },
        { withCredentials: true }
      );

      if (response.data.taskId) {
        onDownloadStart(response.data.taskId, videoId);
        setVideoId('');
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
      <h3 className="text-xl font-bold text-white mb-4">動画ダウンロード</h3>

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
            画質
          </label>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as any)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="auto">自動（推奨）</option>
            <option value="high">高画質</option>
            <option value="low">低画質</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="downloadComments"
            checked={downloadComments}
            onChange={(e) => setDownloadComments(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer"
          />
          <label htmlFor="downloadComments" className="ml-2 text-gray-300 text-sm cursor-pointer">
            コメントもダウンロード
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded transition-colors"
        >
          {loading ? 'ダウンロード中...' : 'ダウンロード開始'}
        </button>
      </form>

      <p className="text-gray-400 text-xs mt-4">
        ℹ️ 大きなファイルはダウンロードに時間がかかる場合があります
      </p>
    </div>
  );
}
