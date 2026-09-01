'use client';

import { FileItem } from '@/lib/gdrive-client';
import { FileTypeIcon } from './FileTypeIcon';

/**
 * ファイル/フォルダ一覧表示
 */
interface FileListViewProps {
  items: FileItem[];
  isLoading?: boolean;
  onFolderClick: (folderId: string, folderName: string) => void;
  onVideoClick?: (fileId: string, fileName: string, folderId?: string) => void;
}

export function FileListView({
  items,
  isLoading = false,
  onFolderClick,
  onVideoClick,
}: FileListViewProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin">
          <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-8 h-8"></div>
        </div>
        <p className="ml-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">ファイルがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <FileListItem
          key={item.id}
          item={item}
          onFolderClick={onFolderClick}
          onVideoClick={onVideoClick}
        />
      ))}
    </div>
  );
}

/**
 * ファイル/フォルダ一覧アイテム
 */
interface FileListItemProps {
  item: FileItem;
  onFolderClick: (folderId: string, folderName: string) => void;
  onVideoClick?: (fileId: string, fileName: string, folderId?: string) => void;
}

function FileListItem({
  item,
  onFolderClick,
  onVideoClick,
}: FileListItemProps) {
  const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
  const isVideo = item.mimeType === 'video/mp4';

  const handleClick = () => {
    if (isFolder) {
      onFolderClick(item.id, item.name);
    } else if (isVideo && onVideoClick) {
      // ✅ folderId を parentId から取得して渡す
      onVideoClick(item.id, item.name, item.parentId);
    }
  };

  // TODO: ファイルサイズや更新日時のフォーマットを共通化する
  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isClickable = isFolder || (isVideo && onVideoClick);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors ${
        isClickable ? 'cursor-pointer' : ''
      }`}
    >
      <FileTypeIcon mimeType={item.mimeType} className="w-8 h-8 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">
          {isFolder ? 'フォルダ' : `${formatSize(item.size)} • ${formatDate(item.modifiedTime)}`}
        </p>
      </div>

      {isFolder && (
        <div className="flex-shrink-0 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
