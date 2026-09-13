/**
 * ドライブ接続情報ストア (Zustand + AsyncStorage)
 * ✅ 複数ドライブのサポート
 * ✅ 選択中のドライブ管理
 * ✅ AsyncStorage に自動保存
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DriveConnectionDto,
  DriveConnectionDtoFromJSON,
} from "@/generated/models";
import { appLogger } from "@/utils/logger";

interface DrivesState {
  // ✅ ドライブ接続情報
  drives: DriveConnectionDto[];
  selectedConnectionId: string | null;
  hydrated: boolean; // hydration 完了フラグ

  // アクション
  setDrives: (drives: DriveConnectionDto[]) => void;
  addDrive: (drive: DriveConnectionDto) => void;
  selectDrive: (connectionId: string) => void;
  getSelectedDrive: () => DriveConnectionDto | null;
  isConnected: (provider: string) => boolean;
  removeDrive: (connectionId: string) => void;
  clearStore: () => void;
  setHydrated: (hydrated: boolean) => void;
}

// ✅ AsyncStorage を使用したカスタムストレージ
const drivesStorage: PersistStorage<Pick<DrivesState, "drives" | "selectedConnectionId">> = {
  getItem: async (key: string) => {
    try {
      appLogger.info(`[DrivesStorage] 読み込み開始: ${key}`);
      const value = await AsyncStorage.getItem(key);
      
      if (value) {
        const parsed = JSON.parse(value);
        appLogger.info(
          `[DrivesStorage] 読み込み成功: ${key}, drives=${parsed.state?.drives?.length || 0}`,
        );
        
        // ✅ スネークケースをキャメルケースにマッピング
        if (parsed.state?.drives && Array.isArray(parsed.state.drives)) {
          const mappedDrives = parsed.state.drives.map((drive: any) => {
            if (drive.connected_at && !drive.connectedAt) {
              return DriveConnectionDtoFromJSON(drive);
            }
            return drive;
          });
          
          appLogger.info(
            `[DrivesStorage] マッピング完了: ${mappedDrives.length} drives`,
          );
          
          return {
            ...parsed,
            state: {
              ...parsed.state,
              drives: mappedDrives,
            },
          };
        }
        
        return parsed;
      }
      
      appLogger.info(`[DrivesStorage] 保存データなし: ${key}`);
      return null;
    } catch (error) {
      appLogger.error(`[DrivesStorage] 読み込み失敗: ${key}`, error);
      return null;
    }
  },

  setItem: async (key: string, value) => {
    try {
      appLogger.info(
        `[DrivesStorage] 保存開始: ${key}, drives=${value.state?.drives?.length || 0}`,
      );
      await AsyncStorage.setItem(key, JSON.stringify(value));
      appLogger.info(`[DrivesStorage] 保存成功: ${key}`);
    } catch (error) {
      appLogger.error(`[DrivesStorage] 保存失敗: ${key}`, error);
    }
  },

  removeItem: async (key: string) => {
    try {
      appLogger.info(`[DrivesStorage] 削除開始: ${key}`);
      await AsyncStorage.removeItem(key);
      appLogger.info(`[DrivesStorage] 削除成功: ${key}`);
    } catch (error) {
      appLogger.error(`[DrivesStorage] 削除失敗: ${key}`, error);
    }
  },
};

export const useDrivesStore = create<DrivesState>()(
  persist(
    (set, get) => ({
      drives: [],
      selectedConnectionId: null,
      hydrated: false,

      setDrives: (drives: DriveConnectionDto[]) => {
        appLogger.info(
          `[DrivesStore] Setting drives: count=${drives.length}, providers=${drives.map((d) => d.provider).join(", ")}`,
        );
        // ✅ drives をマッピング（connected_at → connectedAt）
        const mappedDrives = drives.map((drive) => {
          if ((drive as any).connected_at && !drive.connectedAt) {
            const mapped = DriveConnectionDtoFromJSON(drive);
            return mapped;
          }
          return drive;
        });

        set({ drives: mappedDrives });

        // 最初のドライブを自動選択（以前の選択がない場合）
        const { selectedConnectionId } = get();
        if (!selectedConnectionId && mappedDrives.length > 0) {
          set({ selectedConnectionId: mappedDrives[0].id });
          appLogger.info(
            `[DrivesStore] Auto-selected first drive: id=${mappedDrives[0].id}, provider=${mappedDrives[0].provider}`,
          );
        }
      },

      addDrive: (drive: DriveConnectionDto) => {
        appLogger.info(
          `[DrivesStore] Adding drive: id=${drive.id}, provider=${drive.provider}, account=${drive.account}`,
        );
        
        // ✅ ドライブをマッピング（connected_at → connectedAt）
        const mappedDrive = (drive as any).connected_at && !drive.connectedAt
          ? DriveConnectionDtoFromJSON(drive)
          : drive;

        // ✅ 既に同じドライブが存在する場合はスキップ
        const { drives } = get();
        if (drives.some((d) => d.id === mappedDrive.id)) {
          appLogger.warning(
            `[DrivesStore] Drive already exists: id=${mappedDrive.id}`,
          );
          return;
        }

        // ✅ 新しいドライブを配列に追加
        const updatedDrives = [...drives, mappedDrive];
        set({ drives: updatedDrives });

        // ✅ 新しく追加したドライブを自動選択
        set({ selectedConnectionId: mappedDrive.id });
        appLogger.info(
          `[DrivesStore] Auto-selected newly added drive: id=${mappedDrive.id}`,
        );
      },

      selectDrive: (connectionId: string) => {
        const drive = get().drives.find((d) => d.id === connectionId);
        if (!drive) {
          appLogger.error(
            `[DrivesStore] Drive not found: connectionId=${connectionId}`,
          );
          return;
        }

        appLogger.info(
          `[DrivesStore] Drive selected: id=${connectionId}, provider=${drive.provider}, account=${drive.account}`,
        );

        set({ selectedConnectionId: connectionId });
      },

      getSelectedDrive: () => {
        const { drives, selectedConnectionId } = get();
        if (!selectedConnectionId) return null;
        return drives.find((d) => d.id === selectedConnectionId) || null;
      },

      isConnected: (provider: string) => {
        return get().drives.some(
          (d) => d.provider === provider && d.status === "connected",
        );
      },

      removeDrive: (connectionId: string) => {
        appLogger.info(
          `[DrivesStore] Removing drive: id=${connectionId}`,
        );
        const { drives, selectedConnectionId } = get();
        const updatedDrives = drives.filter((d) => d.id !== connectionId);
        set({ drives: updatedDrives });

        // ✅ 削除したドライブが選択中だった場合、最初のドライブを選択
        if (selectedConnectionId === connectionId) {
          const newSelectedId = updatedDrives.length > 0 ? updatedDrives[0].id : null;
          set({ selectedConnectionId: newSelectedId });
          appLogger.info(
            `[DrivesStore] Selected new drive after removal: id=${newSelectedId}`,
          );
        }
      },

      clearStore: () => {
        appLogger.info("[DrivesStore] Clearing store");
        set({ drives: [], selectedConnectionId: null });
      },

      setHydrated: (hydrated: boolean) => {
        appLogger.info(`[DrivesStore] setHydrated(${hydrated})`);
        set({ hydrated });
      },
    }),
    {
      name: "drives-store",
      storage: drivesStorage,
      partialize: (state) => ({
        // ✅ AsyncStorage に保存する項目（hydrated は除外）
        drives: state.drives,
        selectedConnectionId: state.selectedConnectionId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.drives && state.drives.length > 0) {
          appLogger.info(
            `[DrivesStore] ✅ Rehydrated from AsyncStorage: drives=${state.drives.length}, selectedId=${state.selectedConnectionId}`,
          );
          // ✅ hydration 完了を設定
          state.setHydrated(true);
        } else {
          appLogger.info("[DrivesStore] No persisted data found in AsyncStorage");
          state?.setHydrated(true);
        }
      },
    },
  ),
);
