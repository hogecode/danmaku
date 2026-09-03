'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface DownloadStatusProps {
  taskId: string;
  videoId: string;
  onClose: () => void;
}

interface DownloadInfo {
  status: string;
  progress?: number;
  downloadedSize?: number;
  totalSize?: number;
  downloadUrl?: string;
  error?: string;
  message: string;
}

export function DownloadStatus({ taskId, videoId, onClose }: DownloadStatusProps) {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期状態を「待機中」で設定（API が未実装の場合）
    setDownloadInfo({
      status: 'pending',
      message: 'ダウンロード処理が実行中です...',
    });
    setLoading(false);

    const interval = setInterval(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await axios.get(
          `${apiUrl}/api/nicovideo/status/${taskId}`,
          { withCredentials: true }
        );
        setDownloadInfo(response.data);

        if (
          response.data.status === 'completed' ||
          response.data.status === 'failed'
        ) {
          clearInterval(interval);
        }
      } catch (err: any) {
        // API が 404 を返した場合は、バックグラウンドで処理中と判断
        if (err.response?.status === 404 || err.response?.status === 400) {
          console.debug('ステータスAPI未実装、バックグラウンド処理中と判定:', err.message);
          // 状態は変わらずに待機を続ける
        } else {
          console.error('ステータス取得エラー:', err);
          setDownloadInfo({
            status: 'failed',
            message: `エラー: ${err.message}`,
            error: err.response?.data?.message || err.message
          });
          clearInterval(interval);
        }
      } finally {
        setLoading(false);
      }
    }, 5000); // 5秒ごとにポーリング

    return () => clearInterval(interval);
  }, [taskId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'downloading':
        return 'text-blue-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'failed':
        return '失敗';
      case 'downloading':
        return 'ダウンロード中';
      case 'pending':
        return '待機中';
      default:
        return status;
    }
  };

  const progressPercent = downloadInfo?.progress || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">ダウンロード進捗</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block mb-2">⏳</div>
            <p className="text-gray-300">情報取得中...</p>
          </div>
        ) : downloadInfo ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  ステータス
                </label>
                <p className={`font-bold ${getStatusColor(downloadInfo.status)}`}>
                  {getStatusLabel(downloadInfo.status)}
                </p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  動画ID
                </label>
                <p className="text-gray-200 break-all">{videoId}</p>
              </div>

              {downloadInfo.progress !== undefined && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-gray-400 text-sm">進捗</label>
                    <span className="text-gray-300 text-sm">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {downloadInfo.downloadedSize !== undefined &&
                downloadInfo.totalSize !== undefined && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      サイズ
                    </label>
                    <p className="text-gray-200 text-sm">
                      {(downloadInfo.downloadedSize / 1024 / 1024).toFixed(2)} MB
                      / {(downloadInfo.totalSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

              {downloadInfo.message && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    メッセージ
                  </label>
                  <p className="text-gray-200 text-sm">{downloadInfo.message}</p>
                </div>
              )}

              {downloadInfo.error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
                  {downloadInfo.error}
                </div>
              )}

              {downloadInfo.downloadUrl && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    ダウンロードリンク
                  </label>
                  <a
                    href={downloadInfo.downloadUrl}
                    className="text-blue-400 hover:text-blue-300 break-all text-sm"
                    download
                  >
                    ファイルをダウンロード
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded transition-colors"
            >
              閉じる
            </button>
          </>
        ) : (
          <p className="text-red-300">情報の取得に失敗しました</p>
        )}
      </div>
    </div>
  );
}
