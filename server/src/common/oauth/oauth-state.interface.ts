/**
 * OAuth State 管理インターフェース
 * Redis に JSON形式で保存される
 */
export interface OAuthState {
  purpose: 'login' | 'drive_connection';
  provider: string;
  userId?: bigint;
  timestamp: number;
  codeVerifier?: string;
}
