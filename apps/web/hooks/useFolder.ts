'use client';

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { FolderApi, DriveConnectionApi, Configuration } from '@/lib/generated';
import type { FolderListDto, DriveConnectionDto } from '@/lib/generated';

/**
 * API インスタンスを作成（共通設定）
 */
function createApiConfiguration(): Configuration {
  return new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    baseOptions: {
      withCredentials: true,
    },
  });
}

/**
 * FolderApi インスタンスを作成
 * 新 API はマルチプロバイダー対応（connectionId を必須パラメータとする）
 */
function createFolderApi(): FolderApi {
  return new FolderApi(createApiConfiguration());
}

/**
 * DriveConnectionApi インスタンスを作成
 */
function createDriveConnectionApi(): DriveConnectionApi {
  return new DriveConnectionApi(createApiConfiguration());
}

/**
 * 接続済みドライブリストを取得する Hook
 */
export function useDriveConnections(): UseQueryResult<DriveConnectionDto[], Error> {
  const driveConnectionApi = createDriveConnectionApi();

  return useQuery({
    queryKey: ['driveConnections'],
    queryFn: async () => {
      const response = await driveConnectionApi.driveConnectionControllerList();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分キャッシュ
    gcTime: 30 * 60 * 1000, // 30分ガベージコレクション
  });
}

/**
 * ドライブ接続からフォルダ内容を取得する Hook（TanStack Query キャッシング付き）
 * 
 * @param connectionId - ドライブ接続ID（必須）
 * @param folderId - フォルダID（デフォルト: 'root'）
 */
export function useFolderList(
  connectionId: string,
  folderId: string = 'root'
): UseQueryResult<FolderListDto, Error> {
  const folderApi = createFolderApi();
  
  return useQuery({
    queryKey: ['folder', 'list', connectionId, folderId],
    queryFn: async () => {
      const response = await folderApi.folderControllerListFolderByConnection(
        connectionId,
        folderId
      );
      return response.data;
    },
    enabled: !!connectionId, // connectionId がない場合はクエリを実行しない
    staleTime: 30 * 1000, // 30秒キャッシュ
    gcTime: 10 * 60 * 1000, // 10分（以前の cacheTime）
  });
}

/**
 * ドライブ接続内でキーワード検索する Hook（キャッシュなし）
 * 
 * @param connectionId - ドライブ接続ID（必須）
 */
export function useFolderSearch(
  connectionId: string
): UseMutationResult<
  FolderListDto,
  Error,
  { folderId: string; query: string }
> {
  const folderApi = createFolderApi();
  
  return useMutation({
    mutationFn: async ({ folderId, query }) => {
      const response = await folderApi.folderControllerSearchByConnection(
        connectionId,
        folderId,
        query
      );
      return response.data;
    },
  });
}
