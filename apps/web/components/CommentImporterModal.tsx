'use client';

import { useState } from 'react';
import { NicovideoCommentImporter } from './NicovideoCommentImporter';
import { KakologCommentImporter } from './KakologCommentImporter';
import type { DPlayerCommentDto } from '@/lib/generated/models';

interface CommentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommentsImported: (comments: DPlayerCommentDto[], mergeMode: boolean) => void;
  isDisabled?: boolean;
}

/**
 * コメントインポーター モーダル
 * ニコ動コメントと過去ログを取得するUI
 * 2つのタブで UI を切り替え可能
 */
export function CommentImporterModal({
  isOpen,
  onClose,
  onCommentsImported,
  isDisabled = false,
}: CommentImporterModalProps) {
  const [activeTab, setActiveTab] = useState<'niconico' | 'kakolog'>('niconico');

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* オーバーレイ（背景を暗くする） */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* モーダル本体 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>💬</span>
              コメント インポーター
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-2xl transition"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* タブナビゲーション */}
          <div className="flex border-b border-gray-700 bg-gray-800 sticky top-[76px] z-40">
            <button
              onClick={() => setActiveTab('niconico')}
              className={`flex-1 py-3 px-4 font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'niconico'
                  ? 'bg-pink-500 text-white border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>🎬</span>
              ニコ動コメント
            </button>
            <button
              onClick={() => setActiveTab('kakolog')}
              className={`flex-1 py-3 px-4 font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'kakolog'
                  ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>📺</span>
              過去ログ（Kakolog）
            </button>
          </div>

          {/* コンテンツ */}
          <div className="p-6">
            {/* ニコ動タブ */}
            {activeTab === 'niconico' && (
              <div className="space-y-4">
                <NicovideoCommentImporter
                  onCommentsImported={onCommentsImported}
                  isDisabled={isDisabled}
                  isModalContent={true}
                />
              </div>
            )}

            {/* 過去ログタブ */}
            {activeTab === 'kakolog' && (
              <div className="space-y-4">
                <KakologCommentImporter
                  onCommentsImported={onCommentsImported}
                  isDisabled={isDisabled}
                  isModalContent={true}
                />
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
