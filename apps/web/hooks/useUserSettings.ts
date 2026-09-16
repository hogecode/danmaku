'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { UserSettingsApi, Configuration, UpdateUserSettingsDto, UserSettingsDto } from '@/lib/generated';

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
 * UserSettingsApi インスタンスを作成
 */
function createUserSettingsApi(): UserSettingsApi {
  return new UserSettingsApi(createApiConfiguration());
}

/**
 * ユーザー設定を取得する Hook
 */
export function useUserSettingsQuery(): UseQueryResult<UserSettingsDto, Error> {
  const api = createUserSettingsApi();

  return useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await api.userSettingsControllerGetSettings();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分キャッシュ
    gcTime: 30 * 60 * 1000,    // 30分ガベージコレクション
  });
}

/**
 * ユーザー設定を更新する Hook
 */
export function useUserSettingsUpdate(): UseMutationResult<UserSettingsDto, Error, UpdateUserSettingsDto> {
  const api = createUserSettingsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateDto: UpdateUserSettingsDto) => {
      console.log('[useUserSettingsUpdate] sending:', updateDto);
      const response = await api.userSettingsControllerUpdateSettings(updateDto);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('[useUserSettingsUpdate] success:', data);
      // キャッシュを更新
      queryClient.setQueryData(['userSettings'], data);
    },
    onError: (error) => {
      console.error('[useUserSettings] Error updating settings:', error);
    },
  });
}

/**
 * ユーザー設定をリセットする Hook
 */
export function useUserSettingsReset(): UseMutationResult<UserSettingsDto, Error, void> {
  const api = createUserSettingsApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.userSettingsControllerResetSettings();
      return response.data;
    },
    onSuccess: (data) => {
      // キャッシュを更新
      queryClient.setQueryData(['userSettings'], data);
    },
    onError: (error) => {
      console.error('[useUserSettings] Error resetting settings:', error);
    },
  });
}

/**
 * 統合 Hook（従来の useUserSettings と互換）
 */
export function useUserSettings() {
  const query = useUserSettingsQuery();
  const updateMutation = useUserSettingsUpdate();
  const resetMutation = useUserSettingsReset();

  return {
    settings: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    updateSettings: (dto: UpdateUserSettingsDto) => updateMutation.mutateAsync(dto),
    resetSettings: () => resetMutation.mutateAsync(),
  };
}
