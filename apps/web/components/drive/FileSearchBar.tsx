'use client';

import { useState, useCallback } from 'react';

/**
 * ファイル検索ボックス
 */
interface FileSearchBarProps {
  isLoading?: boolean;
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function FileSearchBar({
  isLoading = false,
  onSearch,
  onClear,
}: FileSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query);
      }
    },
    [query, onSearch],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onClear();
  }, [onClear]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="フォルダ内を検索..."
        disabled={isLoading}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '検索中...' : '検索'}
      </button>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg disabled:cursor-not-allowed transition-colors"
        >
          クリア
        </button>
      )}
    </form>
  );
}
