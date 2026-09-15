/**
 * Redux Selectors
 */

import { RootState } from './index';

export const selectConnections = (state: RootState) => state.drives.connections;

export const selectSelectedConnectionId = (state: RootState) =>
  state.drives.selectedConnectionId;

export const selectSelectedConnection = (state: RootState) => {
  const selectedId = state.drives.selectedConnectionId;
  if (!selectedId) return null;
  return state.drives.connections.find((c) => c.id === selectedId) || null;
};

export const selectHydrated = (state: RootState) => state.drives.hydrated;

export const selectIsConnected = (provider: string) => (state: RootState) => {
  return state.drives.connections.some(
    (c) => c.provider === provider && c.status === 'connected'
  );
};
