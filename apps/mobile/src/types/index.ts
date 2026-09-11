/**
 * 型定義
 * OpenAPI 生成コード + カスタム型の統合
 */

// OpenAPI 生成モデルのインポート
export type { UserInfoDto as UserInfo } from '@/generated/models/UserInfoDto';
export type { LoginResponseDto as LoginResponse } from '@/generated/models/LoginResponseDto';
export type { FileItemDto } from '@/generated/models/FileItemDto';

/**
 * 弾幕コメント (ニコ実況形式)
 */
export interface DanmakuComment {
  thread: string;
  no: number;
  vpos: number; // ビデオの再生位置（秒）
  date: number; // タイムスタンプ
  mail?: string; // メールアドレス（スタイル情報）
  user_id: string;
  premium?: number;
  anonymity?: number;
  text: string;
}

/**
 * ビデオプレイヤー設定
 */
export interface VideoPlayerConfig {
  videoUrl?: string; // initializePlayer で設定される
  videoFileId: string;
  folderId?: string;
  fileName?: string;
  isLocalFile?: boolean; // ローカルファイルフラグ
}
