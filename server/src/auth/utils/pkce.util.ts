import { createHash } from 'crypto';

/**
 * PKCE ペアインターフェース
 */
interface PKCEPair {
  verifier: string;
  challenge: string;
}

/**
 * PKCE（Proof Key for Public Clients）ユーティリティクラス
 * RFC 7636に準拠した実装
 */
export class PKCEUtil {
  private static readonly VERIFIER_LENGTH = 128;
  private static readonly VERIFIER_MIN_LENGTH = 43;
  private static readonly VERIFIER_MAX_LENGTH = 128;
  private static readonly VERIFIER_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    
  private static readonly STATE_LENGTH = 32;
  private static readonly STATE_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  /**
   * Base64 URL-safe エンコード
   */
  private static base64UrlEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * PKCE code_verifier と code_challenge を生成
   * @returns PKCE ペア
   */
  static generatePKCE(): PKCEPair {
    let verifier = '';
    for (let i = 0; i < this.VERIFIER_LENGTH; i++) {
      verifier += this.VERIFIER_CHARS[
        Math.floor(Math.random() * this.VERIFIER_CHARS.length)
      ];
    }

    // code_challenge = BASE64URL(SHA256(code_verifier))
    const challenge = this.base64UrlEncode(
      createHash('sha256').update(verifier).digest(),
    );

    return { verifier, challenge };
  }

  /**
   * State パラメータを生成（CSRF対策）
   * @returns State トークン
   */
  static generateState(): string {
    let state = '';
    for (let i = 0; i < this.STATE_LENGTH; i++) {
      state += this.STATE_CHARS[
        Math.floor(Math.random() * this.STATE_CHARS.length)
      ];
    }
    return state;
  }

  /**
   * State パラメータを検証（CSRF対策）
   * @param sessionState セッションに保存されたstate
   * @param receivedState リクエストパラメータのstate
   * @throws Error if states do not match
   */
  static validateState(sessionState: string, receivedState: string): void {
    if (sessionState !== receivedState) {
      throw new Error('CSRF validation failed: state mismatch');
    }
  }

  /**
   * Verifier の長さを検証（RFC 7636）
   * @param verifier code_verifier
   * @throws Error if verifier length is invalid
   */
  static validateVerifier(verifier: string): void {
    if (
      verifier.length < this.VERIFIER_MIN_LENGTH ||
      verifier.length > this.VERIFIER_MAX_LENGTH
    ) {
      throw new Error(
        `Invalid code_verifier length. Must be ${this.VERIFIER_MIN_LENGTH}-${this.VERIFIER_MAX_LENGTH} characters.`,
      );
    }
  }
}

