'use client';

import { useCallback } from 'react';

/**
 * パンくずナビゲーション
 */
interface FolderBreadcrumbProps {
  currentFolderId: string;
  currentFolderName?: string;
  onNavigate: (folderId: string) => void;
}

export function FolderBreadcrumb({
  currentFolderId,
  currentFolderName = 'My Drive',
  onNavigate,
}: FolderBreadcrumbProps) {
  const handleRootClick = useCallback(() => {
    onNavigate('root');
  }, [onNavigate]);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <button
        onClick={handleRootClick}
        className="hover:text-blue-600 hover:underline transition-colors"
      >
        My Drive
      </button>

      {currentFolderId !== 'root' && (
        <>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">
            {currentFolderName}
          </span>
        </>
      )}
    </div>
  );
}
