'use client';

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { DriveConnectionApi, Configuration } from '@/lib/generated';
import type { DriveConnectionDto, DriveConnectionDeleteResponseDto } from '@/lib/generated';

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
 * DriveConnectionApi インスタンスを作成
 */
export function createDriveConnectionApi(): DriveConnectionApi {
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
 * ドライブ接続を削除する Hook
 * 
 * @returns TanStack Query mutation
 */
export function useDriveConnectionDelete(): UseMutationResult<
  DriveConnectionDeleteResponseDto,
  Error,
  string
> {
  const driveConnectionApi = createDriveConnectionApi();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const response = await driveConnectionApi.driveConnectionControllerDelete(connectionId);
      return response.data;
    },
  });
}
