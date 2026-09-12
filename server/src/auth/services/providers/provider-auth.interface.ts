import { GoogleUserInfoDto, UserInfoDto } from '../../dto';

/**
 * プロバイダー認証の共通インターフェース
 * 各プロバイダー（Google, OneDrive等）はこのインターフェースを実装
 */
export interface ProviderAuthService {
  /**
   * プロバイダーのコールバック処理
   * @param code - OAuth 認可コード
   * @param state - state パラメータ
   * @returns ユーザー情報
   */
  handleCallback(code: string, state: string): Promise<UserInfoDto>;

  /**
   * ユーザー情報を取得
   * @param accessToken - アクセストークン
   * @returns プロバイダーのユーザー情報
   */
  fetchUserInfo(accessToken: string): Promise<GoogleUserInfoDto>;
}
