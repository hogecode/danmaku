/**
 * 汎用 API コール Hook
 * TanStack Query でラップされた API 呼び出し
 */

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

/**
 * useApiQuery
 * 
 * 汎用的な GET リクエスト用 hook
 * 
 * @param key - クエリキー（キャッシュの識別子）
 * @param fn - API 呼び出し関数
 * @param options - useQuery オプション
 * @returns useQuery 結果
 * 
 * @example
 * const { data, isLoading } = useApiQuery(
 *   'myData',
 *   () => fetch('/api/data').then(r => r.json()),
 * );
 */
export function useApiQuery<T>(
  key: string | string[],
  fn: () => Promise<T>,
  options?: UseQueryOptions<T>,
) {
  const queryKey = typeof key === 'string' ? [key] : key;

  return useQuery({
    queryKey,
    queryFn: fn,
    staleTime: 1000 * 60 * 5, // 5分
    gcTime: 1000 * 60 * 30, // 30分
    retry: 1,
    ...options,
  });
}

/**
 * useApiMutation
 * 
 * 汎用的な POST/PUT/DELETE リクエスト用 hook
 * 
 * @param fn - API 呼び出し関数
 * @param options - useMutation オプション
 * @returns useMutation 結果
 * 
 * @example
 * const { mutate, isPending } = useApiMutation(
 *   (data) => fetch('/api/data', { method: 'POST', body: JSON.stringify(data) })
 *     .then(r => r.json()),
 * );
 */
export function useApiMutation<TData, TError = Error, TVariables = unknown>(
  fn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>,
) {
  return useMutation({
    mutationFn: fn,
    retry: 1,
    ...options,
  });
}
