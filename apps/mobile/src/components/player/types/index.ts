/**
 * React Native Video Player Types
 * DPlayer 相当の型定義
 */

/**
 * ビデオ設定
 */
export interface VideoConfig {
  url: string;
  type: 'normal' | 'hls' | 'flv' | 'dash';
  pic?: string;  // ビデオサムネイル
  duration?: number;
}

/**
 * プレイヤー設定
 */
export interface PlayerConfig {
  container: any;  // React Native の View ref
  video: VideoConfig;
  autoplay?: boolean;
  theme?: string;  // テーマカラー（#RRGGBB）
  loop?: boolean;
  lang?: 'en' | 'ja-jp' | 'zh-CN';
  screenshot?: boolean;
  hotkey?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  volume?: number;  // 0-1
  playbackRate?: number[];  // 再生速度の選択肢
  defaultPlaybackRate?: number;
  contextMenu?: Array<{
    text: string;
    link?: string;
    click?: () => void;
  }>;
  mutex?: boolean;  // 他のプレイヤーを停止
  pip?: boolean;  // ピクチャインピクチャ
  pluginOptions?: Record<string, any>;
  whitelist?: string[];

  // ダンマク（コメント）設定
  danmaku?: DanmakuConfig;

  // API バックエンド設定
  apiBackend?: APIBackendConfig;
}

/**
 * ダンマク（コメント）設定
 */
export interface DanmakuConfig {
  id?: string;  // ローカルストレージキー
  user?: string;  // デフォルトユーザー名
  bottom?: number;  // コメント表示開始位置（%）
  unlimited?: boolean;  // 無制限表示
  speedRate?: number;  // スピード（1 = デフォルト）
  fontSize?: number;  // フォントサイズ（px）
  opacity?: number;  // 透明度（0-1）
  defaultColor?: string;  // デフォルト色（#RRGGBB）
  synchronousPlayback?: boolean;  // 同期再生
  useDatabase?: boolean;  // ローカルDB使用
  closeCommentFormAfterSend?: boolean;  // 送信後入力欄を閉じる
  // ✅ 新規: トラック管理
  maxTracks?: number;  // 最大トラック数（デフォルト: 8）。この値に基づいてフォントサイズが自動調整される
}

/**
 * ダンマク（コメント）データ
 */
export interface Danmaku {
  time: number;  // 表示開始時刻（秒）
  type: 'normal' | 'top' | 'bottom';  // 流れるコメント/上固定/下固定
  color: string;  // 色（#RRGGBB）
  author: string;  // 投稿者
  text: string;  // テキスト
  size?: 'normal' | 'small' | 'large';  // サイズ
  fontSize?: number;  // フォントサイズ（px）
}

/**
 * API バックエンド設定
 */
export interface APIBackendConfig {
  read?: (options: { success: (comments: Danmaku[]) => void; error: (msg: string) => void }) => void;
  send?: (options: { comment: Danmaku; success: () => void; error: (msg: string) => void }) => void;
  // WebAPI エンドポイント
  api?: string;  // `/api/v1/comments`
  token?: string;  // 認証トークン
  user?: {
    id: string;
    name: string;
  };
}

/**
 * プレイヤー状態
 */
export interface PlayerState {
  // 再生状態
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;

  // UI 状態
  fullscreen: boolean;
  pip: boolean;  // ピクチャインピクチャ
  controlsVisible: boolean;

  // コメント状態
  danmakuVisible: boolean;
  danmakuList: Danmaku[];
  visibleDanmakus: Danmaku[];

  // ローディング状態
  loading: boolean;
  buffering: number;  // 0-100 (%)
  error?: string;
}

/**
 * プレイヤーメソッド
 */
export interface PlayerMethods {
  play(): void;
  pause(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setPlaybackRate(rate: number): void;
  setFullscreen(fullscreen: boolean): void;
  setPip(pip: boolean): void;
  showDanmaku(): void;
  hideDanmaku(): void;
  sendDanmaku(danmaku: Danmaku): void;
  addDanmaku(danmaku: Danmaku | Danmaku[]): void;
  removeDanmaku(danmaku: Danmaku): void;
  clearDanmaku(): void;
  destroy(): void;
}

/**
 * プレイヤーイベント
 */
export type PlayerEventMap = {
  play: void;
  pause: void;
  playing: void;
  ended: void;
  error: string;
  timeupdate: number;
  durationchange: number;
  volumechange: number;
  ratechange: number;
  fullscreen: boolean;
  pip: boolean;
  danmaku_show: void;
  danmaku_hide: void;
  danmaku_send: Danmaku;
};
