/**
 * ドライブ接続情報ストア (Redux Toolkit + localStorage)
 * ✅ 複数ドライブのサポート
 * ✅ 選択中のドライブ管理
 * ✅ localStorage に自動保存
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DriveConnectionDto } from '@/lib/generated';

interface DrivesState {
  // ✅ ドライブ接続情報
  connections: DriveConnectionDto[];
  selectedConnectionId: string | null;
  hydrated: boolean; // hydration 完了フラグ
}

const initialState: DrivesState = {
  connections: [],
  selectedConnectionId: null,
  hydrated: false,
};

export const drivesSlice = createSlice({
  name: 'drives',
  initialState,
  reducers: {
    // ✅ API から取得したドライブ接続一覧をセット
    setConnections: (state, action: PayloadAction<DriveConnectionDto[]>) => {
      state.connections = action.payload;

      // 最初の接続を自動選択（以前の選択がない場合）
      if (!state.selectedConnectionId && action.payload.length > 0) {
        state.selectedConnectionId = action.payload[0].id;
      }
    },

    // ✅ 新しいドライブを追加
    addConnection: (state, action: PayloadAction<DriveConnectionDto>) => {
      // 既に同じドライブが存在する場合はスキップ
      if (state.connections.some((c) => c.id === action.payload.id)) {
        return;
      }

      state.connections.push(action.payload);

      // 新しく追加したドライブを自動選択
      state.selectedConnectionId = action.payload.id;
    },

    // ✅ ドライブを選択
    selectConnection: (state, action: PayloadAction<string>) => {
      const connection = state.connections.find((c) => c.id === action.payload);
      if (connection) {
        state.selectedConnectionId = action.payload;
      }
    },

    // ✅ ドライブを削除
    removeConnection: (state, action: PayloadAction<string>) => {
      state.connections = state.connections.filter((c) => c.id !== action.payload);

      // 削除したドライブが選択中だった場合、最初のドライブを選択
      if (state.selectedConnectionId === action.payload) {
        state.selectedConnectionId =
          state.connections.length > 0 ? state.connections[0].id : null;
      }
    },

    // ✅ ストアをクリア
    clearConnections: (state) => {
      state.connections = [];
      state.selectedConnectionId = null;
    },

    // ✅ Hydration 完了を設定
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
});

export const {
  setConnections,
  addConnection,
  selectConnection,
  removeConnection,
  clearConnections,
  setHydrated,
} = drivesSlice.actions;

export default drivesSlice.reducer;
