import { GoogleTokenDto } from '../../dto';

/**
 * プロバイダートークン管理の共通インターフェース
 * 各プロバイダー（Google, OneDrive等）はこのインターフェースを実装
 */
export interface ProviderTokenService {
  /**
   * 認可URL を生成
   * @param userId - ユーザーID（オプション）
   * @returns { authorize_url, state, expires_in }
   */
  generateAuthorizationUrl(
    userId?: bigint,
  ): Promise<{ authorize_url: string; state: string; expires_in: number }>;

  /**
   * 認可コードからアクセストークンを取得
   * @param code - OAuth 認可コード
   * @param codeVerifier - PKCE code verifier
   * @param redirectUri - OAuth認可リクエスト時に使用したリダイレクトURI
   */
  exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<GoogleTokenDto>;

  /**
   * リフレッシュトークンからアクセストークンを更新
   * @param refreshToken - リフレッシュトークン
   */
  refreshAccessToken(refreshToken: string): Promise<GoogleTokenDto>;

  /**
   * トークンをリボーク（取り消し）
   * @param accessToken - アクセストークン
   */
  revokeToken(accessToken: string): Promise<void>;
}
