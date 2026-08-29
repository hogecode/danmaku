'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useGDriveFolder, useGDriveSearch } from '@/hooks/useGDrive';
import { FolderBreadcrumb } from '@/components/GDrive/FolderBreadcrumb';
import { FileListView } from '@/components/GDrive/FileListView';
import { FileSearchBar } from '@/components/GDrive/FileSearchBar';
import { FileItem } from '@/lib/gdrive-client';

/**
 * Google Drive ページ
 */
export default function DrivePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const [folderId, setFolderId] = useState('root');
  const [folderName, setFolderName] = useState('My Drive');
  const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);

  const { data: folderData, isLoading: isFolderLoading } =
    useGDriveFolder(folderId);
  const searchMutation = useGDriveSearch();

  // 未認証の場合はログインページへリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleFolderClick = useCallback(
    (clickedFolderId: string, clickedFolderName: string) => {
      setFolderId(clickedFolderId);
      setFolderName(clickedFolderName);
      setSearchResults(null);
    },
    [],
  );

  const handleSearch = useCallback(
    async (query: string) => {
      try {
        const result = await searchMutation.mutateAsync({
          folderId,
          query,
        });
        setSearchResults(result.items);
      } catch (error) {
        console.error('Search failed:', error);
      }
    },
    [folderId, searchMutation],
  );

  const handleClearSearch = useCallback(() => {
    setSearchResults(null);
  }, []);

  const handleVideoClick = useCallback(
    (fileId: string, fileName: string) => {
      // TODO: ビデオプレイヤーページにナビゲート
      console.log('Video clicked:', fileId, fileName);
    },
    [],
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin">
          <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const displayItems = searchResults || folderData?.items || [];
  const isLoading = isFolderLoading || searchMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Danmaku Drive</h1>
            <button
              onClick={() => router.push('/home')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ホーム
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* パンくずナビゲーション */}
          <div className="mb-6">
            <FolderBreadcrumb
              currentFolderId={folderId}
              currentFolderName={folderName}
              onNavigate={handleFolderClick}
            />
          </div>

          {/* 検索ボックス */}
          <div className="mb-6">
            <FileSearchBar
              isLoading={searchMutation.isPending}
              onSearch={handleSearch}
              onClear={handleClearSearch}
            />
          </div>

          {/* エラー表示 */}
          {searchMutation.isError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">
                検索に失敗しました。もう一度試してください。
              </p>
            </div>
          )}

          {/* ファイル/フォルダ一覧 */}
          <FileListView
            items={displayItems}
            isLoading={isLoading}
            onFolderClick={handleFolderClick}
            onVideoClick={handleVideoClick}
          />
        </div>
      </main>
    </div>
  );
}
