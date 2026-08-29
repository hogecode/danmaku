'use client';

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { gdriveClient, type FolderList } from '@/lib/gdrive-client';

/**
 * フォルダ内容を取得する Hook（TanStack Query キャッシング付き）
 */
export function useGDriveFolder(folderId: string = 'root'): UseQueryResult<FolderList, Error> {
  return useQuery({
    queryKey: ['gdrive', 'folder', folderId],
    queryFn: () => gdriveClient.listFolder(folderId),
    staleTime: 30 * 1000, // 30秒キャッシュ
    gcTime: 10 * 60 * 1000, // 10分（以前の cacheTime）
  });
}

/**
 * フォルダ内検索する Hook（キャッシュなし）
 */
export function useGDriveSearch(): UseMutationResult<
  FolderList,
  Error,
  { folderId: string; query: string }
> {
  return useMutation({
    mutationFn: ({ folderId, query }) =>
      gdriveClient.search(folderId, query),
  });
}
