/**
 * Redux Selectors
 */

import { RootState } from './index';

// ✅ Drives セレクター
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


// ✅ Auth セレクター
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthLoginLoading = (state: RootState) => state.auth.loginLoading;
export const selectAuthLogoutLoading = (state: RootState) => state.auth.logoutLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthAllLoading = (state: RootState) =>
  state.auth.loading || state.auth.loginLoading || state.auth.logoutLoading;
