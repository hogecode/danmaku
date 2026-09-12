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
  selectDrive: (connectionId: string) => void;
  getSelectedDrive: () => DriveConnectionDto | null;
  isConnected: (provider: string) => boolean;
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
