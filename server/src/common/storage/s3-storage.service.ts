import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerService } from '../logger/logger.service';

/**
 * S3 ストレージサービス
 * AWS S3 へのファイルアップロード・ダウンロード・URL生成を管理
 */
@Injectable()
export class S3StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private prefix: string;
  private expirationHours: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const region = this.configService.get<string>('AWS_REGION') || 'ap-northeast-1';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'danmaku-downloads';
    this.prefix = this.configService.get<string>('AWS_S3_PREFIX') || 'nicovideo/';
    this.expirationHours = this.configService.get<number>('AWS_S3_EXPIRATION_HOURS') || 24;

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });

    this.logger.info('S3StorageService initialized', {
      bucket: this.bucket,
      region,
      prefix: this.prefix,
    });
  }

  /**
   * ファイルを S3 にアップロード
   * @param filePath ローカルファイルパス
   * @param s3Key S3 キー（パス）
   * @returns アップロード後の S3 キー
   */
  async uploadFile(filePath: string, s3Key: string): Promise<string> {
    try {
      this.logger.debug(`S3 アップロード開始: ${filePath} → ${s3Key}`, {
        filePath,
        s3Key,
      });

      const fileStream = fs.createReadStream(filePath);
      const fileSize = fs.statSync(filePath).size;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: fileStream,
        ContentLength: fileSize,
        Metadata: {
          'uploaded-at': new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      this.logger.info(`S3 アップロード完了: ${s3Key}`, {
        s3Key,
        fileSize,
      });

      return s3Key;
    } catch (error) {
      this.logger.error(`S3 アップロード失敗: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * S3 から署名付きURL を生成
   * @param s3Key S3 キー
   * @returns 署名付きURL（有効期限付き）
   */
  async generatePresignedUrl(s3Key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      const expirationSeconds = this.expirationHours * 3600;
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: expirationSeconds,
      });

      this.logger.debug(`署名付きURL生成: ${s3Key}`, {
        s3Key,
        expirationHours: this.expirationHours,
      });

      return url;
    } catch (error) {
      this.logger.error(`署名付きURL生成失敗: ${s3Key}`, error as Error);
      throw error;
    }
  }

  /**
   * S3 から ファイルをダウンロード
   * @param s3Key S3 キー
   * @param destinationPath ローカル保存先パス
   */
  async downloadFile(s3Key: string, destinationPath: string): Promise<void> {
    try {
      this.logger.debug(`S3 ダウンロード開始: ${s3Key} → ${destinationPath}`, {
        s3Key,
        destinationPath,
      });

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('S3 レスポンス Body が空です');
      }

      // ディレクトリを作成
      const dir = path.dirname(destinationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(destinationPath);
      const body = response.Body as NodeJS.ReadableStream;

      body.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          this.logger.info(`S3 ダウンロード完了: ${s3Key}`, { s3Key });
          resolve();
        });
        writeStream.on('error', (error) => {
          this.logger.error(`S3 ダウンロード失敗: ${s3Key}`, error);
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error(`S3 ダウンロード失敗: ${s3Key}`, error as Error);
      throw error;
    }
  }

  /**
   * S3 から ファイルを削除
   * @param s3Key S3 キー
   */
  async deleteFile(s3Key: string): Promise<void> {
    try {
      this.logger.debug(`S3 削除開始: ${s3Key}`, { s3Key });

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      await this.s3Client.send(command);

      this.logger.info(`S3 削除完了: ${s3Key}`, { s3Key });
    } catch (error) {
      this.logger.error(`S3 削除失敗: ${s3Key}`, error as Error);
      throw error;
    }
  }

  /**
   * S3 キーの組み立て（prefixを含む）
   * @param fileName ファイル名
   * @returns S3 キー
   */
  buildS3Key(fileName: string): string {
    return path.join(this.prefix, fileName).replace(/\\/g, '/');
  }
}
