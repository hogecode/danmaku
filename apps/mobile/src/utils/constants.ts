/**
 * アプリケーション定数
 */

// API設定
export const API_BASE_URL = 'http://api.danmaku.cloud:3001';
export const API_TIMEOUT = 10000; // 10秒

// Deep Link スキーム
export const DEEP_LINK_SCHEME = 'danmaku://';
export const DEEP_LINK_AUTH_CALLBACK = 'danmaku://auth-callback';

// トークン保存キー
export const TOKEN_STORAGE_KEY = 'danmaku_access_token';
export const USER_STORAGE_KEY = 'danmaku_user_info';

// ファイルタイプ MIME
export const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

// UI定数
export const BOTTOM_TAB_INSET = 60;
