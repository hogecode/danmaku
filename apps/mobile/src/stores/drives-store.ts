/**
 * ドライブ接続情報ストア (Zustand + AsyncStorage)
 * ✅ 複数ドライブのサポート
 * ✅ 選択中のドライブ管理
 * ✅ AsyncStorage に自動保存
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

  // アクション
  setDrives: (drives: DriveConnectionDto[]) => void;
  addDrive: (drive: DriveConnectionDto) => void;
  selectDrive: (connectionId: string) => void;
  getSelectedDrive: () => DriveConnectionDto | null;
  isConnected: (provider: string) => boolean;
  removeDrive: (connectionId: string) => void;
}

export const useDrivesStore = create<DrivesState>()(
  persist(
    (set, get) => ({
      drives: [],
      selectedConnectionId: null,

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
        if (!selectedConnectionId && drives.length > 0) {
          set({ selectedConnectionId: drives[0].id });
          appLogger.info(
            `[DrivesStore] Auto-selected first drive: id=${drives[0].id}, provider=${drives[0].provider}`,
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
          appLogger.warn(
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
    }),
    {
      name: "drives-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // ✅ AsyncStorage に保存する項目
        drives: state.drives,
        selectedConnectionId: state.selectedConnectionId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.drives.length > 0) {

          // ✅ AsyncStorage から復元されたデータをマッピング
          const mappedDrives = state.drives.map((drive) => {
            if ((drive as any).connected_at && !drive.connectedAt) {
              // スネークケースで来たデータをマッピング
              return DriveConnectionDtoFromJSON(drive);
            }
            return drive;
          });
          state.drives = mappedDrives;
        }
      },
    },
  ),
);
