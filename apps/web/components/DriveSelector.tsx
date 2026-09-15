'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { selectConnections, selectSelectedConnection } from '@/lib/store/selectors';
import { selectConnection } from '@/lib/store/slices/drivesSlice';
import type { DriveConnectionDto } from '@/lib/generated';

/**
 * ドライブ接続を切り替えるセレクター
 */
export function DriveSelector() {
  const dispatch = useAppDispatch();
  const connections = useAppSelector(selectConnections);
  const selectedConnection = useAppSelector(selectSelectedConnection);

  if (connections.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-gray-600">
        ドライブ接続がありません
      </div>
    );
  }

  if (connections.length === 1) {
    return (
      <div className="px-4 py-2 text-sm font-medium text-gray-700">
        {connections[0].account || connections[0].provider}
      </div>
    );
  }

  return (
    <select
      value={selectedConnection?.id || ''}
      onChange={(e) => dispatch(selectConnection(e.target.value))}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {connections.map((connection) => (
        <option key={connection.id} value={connection.id}>
          {connection.account || connection.provider}
          {connection.status !== 'connected' && ` (${connection.status})`}
        </option>
      ))}
    </select>
  );
}
