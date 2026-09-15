'use client';

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { GDriveApi, Configuration } from '@/lib/generated';
import type { FolderListDto } from '@/lib/generated';

/**
 * GDriveApi インスタンスを作成
 */
function createGDriveApi(): GDriveApi {
  const configuration = new Configuration({
    basePath: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
    baseOptions: {
      withCredentials: true,
    },
  });
  return new GDriveApi(configuration);
}

/**
 * フォルダ内容を取得する Hook（TanStack Query キャッシング付き）
 */
export function useGDriveFolder(folderId: string = 'root'): UseQueryResult<FolderListDto, Error> {
  const gdriveApi = createGDriveApi();
  
  return useQuery({
    queryKey: ['gdrive', 'folder', folderId],
    queryFn: async () => {
      const response = await gdriveApi.gDriveControllerListFolder(folderId);
      return response.data;
    },
    staleTime: 30 * 1000, // 30秒キャッシュ
    gcTime: 10 * 60 * 1000, // 10分（以前の cacheTime）
  });
}

/**
 * フォルダ内検索する Hook（キャッシュなし）
 */
export function useGDriveSearch(): UseMutationResult<
  FolderListDto,
  Error,
  { folderId: string; query: string }
> {
  const gdriveApi = createGDriveApi();
  
  return useMutation({
    mutationFn: async ({ folderId, query }) => {
      const response = await gdriveApi.gDriveControllerSearch(folderId, query);
      return response.data;
    },
  });
}
