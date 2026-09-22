import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm: string;
  private readonly encryptionKey: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {
    // 環境変数から暗号化キーを取得
    // NOTE: process.env を優先（main.ts で AWS Secrets Manager から設定されるため）
    // その後、ConfigService にフォールバック
    const keyString = process.env.ENCRYPTION_KEY || this.configService.get<string>('ENCRYPTION_KEY');
    if (!keyString || keyString.length !== 64) {
      throw new Error(
        `ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ` +
        `Got: ${keyString ? `${keyString.length} chars` : 'undefined'}`
      );
    }
    this.encryptionKey = Buffer.from(keyString, 'hex');

    // アルゴリズムを環境変数から取得（デフォルト: aes-256-gcm）
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || this.configService.get<string>('ENCRYPTION_ALGORITHM') || 'aes-256-gcm';

    // IV は暗号化時に生成、復号時に暗号文から抽出
    // 固定 IV は使用しない（セキュリティ上の問題）
    this.iv = Buffer.alloc(16); // ダミー、実際には generate で生成
  }

  /**
   * トークンを AES-256 で暗号化
   * @param plaintext 平文
   * @returns base64 エンコードされた暗号文 (IV + ciphertext[+ authTag])
   */
  encrypt(plaintext: string): string {
    // ランダムな IV を生成
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // GCM モードの場合、認証タグを取得
    let authTag = '';
    if (this.algorithm.includes('gcm')) {
      authTag = ':' + (cipher as any).getAuthTag().toString('hex');
    }

    // IV + ciphertext[+ authTag] を結合して base64 エンコード
    const combined = iv.toString('hex') + ':' + encrypted + authTag;
    return Buffer.from(combined).toString('base64');
  }

  /**
   * トークンを AES-256 で復号
   * @param encrypted base64 エンコードされた暗号文 (IV + ciphertext[+ authTag])
   * @returns 平文
   */
  decrypt(encrypted: string): string {
    try {
      // Base64 デコード
      const combined = Buffer.from(encrypted, 'base64').toString('utf8');
      const parts = combined.split(':');

      if (parts.length < 2) {
        throw new Error('Invalid encrypted format');
      }

      const ivHex = parts[0];
      const ciphertext = parts[1];
      const authTagHex = parts[2]; // GCM の場合のみ存在

      if (!ivHex || !ciphertext) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

      // GCM モードの場合、認証タグをセット
      if (this.algorithm.includes('gcm') && authTagHex) {
        const authTag = Buffer.from(authTagHex, 'hex');
        (decipher as any).setAuthTag(authTag);
      }

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }
}
