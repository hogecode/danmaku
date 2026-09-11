/**
 * プレイヤー設定ストア（Zustand + AsyncStorage）
 * ユーザー設定（コメント色、透明度など）をローカルストレージに保存・復元
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appLogger } from '@/utils/logger';

// デフォルト設定
export const DEFAULT_DANMAKU_COLOR = '#FFFFFF'; // 白
export const DEFAULT_DANMAKU_OPACITY = 1;
export const DEFAULT_PLAYBACK_RATE = 1;
export const DEFAULT_AUTO_PLAY = true;
export const DEFAULT_DANMAKU_FONT_SIZE = 24;
export const DEFAULT_BACK_SEEK_SECONDS = 10;
export const DEFAULT_FORWARD_SEEK_SECONDS = 10;

/**
 * プレイヤー設定の型定義
 */
export interface PlayerSettings {
  // コメント設定
  danmakuDefaultColor: string; // デフォルト色（#RRGGBB）
  danmakuOpacity: number; // 透明度（0-1）
  danmakuFontSize: number; // フォントサイズ（12-48）

  // 再生設定
  playbackRate: number; // 再生速度
  autoPlay: boolean; // 自動再生
  backSeekSeconds: number; // 戻るボタンの秒数（1-30）
  forwardSeekSeconds: number; // 進むボタンの秒数（1-30）

  // UI/その他
  [key: string]: any; // 拡張性のため
}

/**
 * ストア状態の型定義
 */
export interface PlayerSettingsState {
  // 状態
  settings: PlayerSettings;
  loaded: boolean;
  loading: boolean;
  error: string | null;

  // アクション
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<PlayerSettings>) => Promise<void>;
  setSetting: (key: keyof PlayerSettings, value: any) => Promise<void>;
  reset: () => Promise<void>;
}

// AsyncStorage キー
const STORAGE_KEY = '@danmaku_player_settings';

/**
 * Zustand ストア
 */
export const usePlayerSettingsStore = create<PlayerSettingsState>(
  (set, get) => ({
    // 初期状態
    settings: {
      danmakuDefaultColor: DEFAULT_DANMAKU_COLOR,
      danmakuOpacity: DEFAULT_DANMAKU_OPACITY,
      danmakuFontSize: DEFAULT_DANMAKU_FONT_SIZE,
      playbackRate: DEFAULT_PLAYBACK_RATE,
      autoPlay: DEFAULT_AUTO_PLAY,
      backSeekSeconds: DEFAULT_BACK_SEEK_SECONDS,
      forwardSeekSeconds: DEFAULT_FORWARD_SEEK_SECONDS,
    },
    loaded: false,
    loading: false,
    error: null,

    /**
     * AsyncStorage から設定をロード
     */
    loadSettings: async () => {
      try {
        set({ loading: true, error: null });
        
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (stored) {
          const settings = JSON.parse(stored) as PlayerSettings;
          appLogger.debug(`[PlayerSettingsStore] Settings loaded from AsyncStorage: ${JSON.stringify(settings)}`);
          set({ settings, loaded: true, loading: false });
        } else {
          appLogger.debug('[PlayerSettingsStore] No settings found, using defaults');
          set({ loaded: true, loading: false });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        appLogger.error(`[PlayerSettingsStore] Failed to load settings: ${errorMsg}`);
        set({ error: errorMsg, loading: false, loaded: true });
      }
    },

    /**
     * 複数の設定を更新（バッチ更新）
     */
    updateSettings: async (updates: Partial<PlayerSettings>) => {
      try {
        set({ loading: true, error: null });
        
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...updates };
        
        // AsyncStorage に保存
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        
        appLogger.debug(`[PlayerSettingsStore] Settings updated and saved: ${JSON.stringify(newSettings)}`);
        set({ settings: newSettings, loading: false });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        appLogger.error(`[PlayerSettingsStore] Failed to update settings: ${errorMsg}`);
        set({ error: errorMsg, loading: false });
      }
    },

    /**
     * 1つの設定を更新
     */
    setSetting: async (key: keyof PlayerSettings, value: any) => {
      await get().updateSettings({ [key]: value });
    },

    /**
     * 設定をリセット
     */
    reset: async () => {
      try {
        set({ loading: true, error: null });
        
        const defaultSettings: PlayerSettings = {
          danmakuDefaultColor: DEFAULT_DANMAKU_COLOR,
          danmakuOpacity: DEFAULT_DANMAKU_OPACITY,
          danmakuFontSize: DEFAULT_DANMAKU_FONT_SIZE,
          playbackRate: DEFAULT_PLAYBACK_RATE,
          autoPlay: DEFAULT_AUTO_PLAY,
          backSeekSeconds: DEFAULT_BACK_SEEK_SECONDS,
          forwardSeekSeconds: DEFAULT_FORWARD_SEEK_SECONDS,
        };
        
        await AsyncStorage.removeItem(STORAGE_KEY);
        appLogger.info('[PlayerSettingsStore] Settings reset to defaults');
        set({ settings: defaultSettings, loading: false });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        appLogger.error(`[PlayerSettingsStore] Failed to reset settings: ${errorMsg}`);
        set({ error: errorMsg, loading: false });
      }
    },
  })
);
