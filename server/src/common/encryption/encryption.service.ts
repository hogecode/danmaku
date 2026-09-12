import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly encryptionKey: Buffer;
  private readonly iv: Buffer;

  constructor(private configService: ConfigService) {
    // 環境変数から暗号化キーを取得
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (!keyString || keyString.length !== 64) {
      throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }
    this.encryptionKey = Buffer.from(keyString, 'hex');

    // IV は暗号化時に生成、復号時に暗号文から抽出
    // 固定 IV は使用しない（セキュリティ上の問題）
    this.iv = Buffer.alloc(16); // ダミー、実際には generate で生成
  }

  /**
   * トークンを AES-256-CBC で暗号化
   * @param plaintext 平文
   * @returns base64 エンコードされた暗号文 (IV + ciphertext)
   */
  encrypt(plaintext: string): string {
    // ランダムな IV を生成
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // IV + ciphertext を結合して base64 エンコード
    const combined = iv.toString('hex') + ':' + encrypted;
    return Buffer.from(combined).toString('base64');
  }

  /**
   * トークンを AES-256-CBC で復号
   * @param encrypted base64 エンコードされた暗号文 (IV + ciphertext)
   * @returns 平文
   */
  decrypt(encrypted: string): string {
    try {
      // Base64 デコード
      const combined = Buffer.from(encrypted, 'base64').toString('utf8');
      const [ivHex, ciphertext] = combined.split(':');

      if (!ivHex || !ciphertext) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}
