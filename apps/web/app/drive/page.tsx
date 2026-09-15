'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useDriveConnections, useFolderList, useFolderSearch } from '@/hooks/useFolder';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectSelectedConnection, selectHydrated } from '@/lib/store/selectors';
import { setConnections, selectConnection } from '@/lib/store/slices/drivesSlice';
import { FolderBreadcrumb } from '@/components/drive/FolderBreadcrumb';
import { FileListView } from '@/components/drive/FileListView';
import { FileSearchBar } from '@/components/drive/FileSearchBar';
import { DriveSelector } from '@/components/DriveSelector';
import type { FileItemDto } from '@/lib/generated';

/**
 * Google Drive ページ
 */
export default function DrivePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();
  const [folderId, setFolderId] = useState('root');
  const [folderName, setFolderName] = useState('My Drive');
  const [searchResults, setSearchResults] = useState<FileItemDto[] | null>(null);

  // Redux から選択中のドライブと hydration 状態を取得
  const selectedConnection = useAppSelector(selectSelectedConnection);
  const hydrated = useAppSelector(selectHydrated);

  // API からドライブ接続一覧を取得
  const { data: connections, isLoading: isConnectionsLoading } = useDriveConnections();

  // ドライブ接続一覧が取得できたら Redux に保存
  useEffect(() => {
    if (connections && connections.length > 0) {
      dispatch(setConnections(connections));
    }
  }, [connections, dispatch]);

  // 選択中の接続 ID を取得（Redux から、ない場合は最初の接続）
  const connectionId = selectedConnection?.id || connections?.[0]?.id || '';

  // 指定された接続のフォルダ内容を取得
  const { data: folderData, isLoading: isFolderLoading } =
    useFolderList(connectionId, folderId);

  const searchMutation = useFolderSearch(connectionId);

  // 未認証の場合はログインページへリダイレクト
  useEffect(() => {
    // TODO: ミドルウェアで認証を行うようにする
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleFolderClick = useCallback(
    (clickedFolderId: string, clickedFolderName?: string) => {
      setFolderId(clickedFolderId);
      setFolderName(clickedFolderName ?? folderName);
      setSearchResults(null);
    },
    [folderName],
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
    (fileId: string, fileName: string, folderId?: string) => {
      // /watch ページにナビゲート（fileId と folderId をクエリパラメータで渡す）
      const params = new URLSearchParams({
        fileId: encodeURIComponent(fileId),
      });
      if (folderId) {
        params.append('folderId', encodeURIComponent(folderId));
      }
      router.push(`/watch?${params.toString()}`);
    },
    [router],
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
  const isLoading = isConnectionsLoading || isFolderLoading || searchMutation.isPending;

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
          {/* ドライブセレクター */}
          {connections && connections.length > 1 && (
            <div className="mb-6 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                ドライブ:
              </label>
              <DriveSelector />
            </div>
          )}

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
