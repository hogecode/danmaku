import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import {
  NicovideoDownloadJobData,
  NicovideoDownloadJobResult,
  NicovideoDownloadProgress,
} from './nicovideo-download.job';
import Redis from 'ioredis';

/**
 * ニコ動ダウンロードワーカー（Processor）
 */
@Processor('nicovideo-download')
@Injectable()
export class NicovideoDownloadProcessor extends WorkerHost {
  private redis!: Redis;
  private browser: Browser | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly s3Storage: S3StorageService,
  ) {
    super();
    this.initializeRedis();
  }

  // Redisの初期化処理
  private initializeRedis(): void {
    const redisHost =
      this.configService.get<string>('REDIS_HOST') || 'localhost';
    const redisPort = this.configService.get<number>('REDIS_PORT') || 6379;
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');

    const config: any = { host: redisHost, port: redisPort };
    if (redisPassword) config.password = redisPassword;

    this.redis = new Redis(config);
  }

  // ニコ動の動画をダウンロードしてS3にアップロードする処理
  async process(
    job: Job<NicovideoDownloadJobData>,
  ): Promise<NicovideoDownloadJobResult> {
    const { jobId, videoId } = job.data;

    try {
      this.logger.info(`ニコ動ダウンロード開始: ${videoId} (Job: ${jobId})`, {
        jobId,
        videoId,
      });

      await this.publishProgress(jobId, {
        step: 'initializing',
        percentage: 5,
        message: 'ブラウザを初期化中...',
      });

      // Chromiumブラウザを起動
      // Docker環境ではシステムパッケージのchromiumを使用
      this.browser = await chromium.launch({
        headless:
          this.configService.get<string>('PLAYWRIGHT_HEADLESS') !== 'false',
        // Docker環境でシステムchromiumを使用
        executablePath: process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD 
          ? '/usr/bin/chromium-browser' 
          : undefined,
      });

      const context = await this.browser.newContext({ 
        bypassCSP: true,
        acceptDownloads: true, // ダウンロード機能を有効化
      });
      const page = await context.newPage();
      
      await this.publishProgress(jobId, {
        step: 'accessing_nicovideo',
        percentage: 10,
        message: 'ニコ動にアクセス中...',
      });

      const videoUrl = `https://ext.nicovideo.jp/?${videoId}`;
      await page.goto(videoUrl, { waitUntil: 'networkidle', timeout: 60000 });

      await this.publishProgress(jobId, {
        step: 'downloading_video',
        percentage: 20,
        message: '動画をダウンロード中...',
      });

      const quality = '720p'; // '360p' | '480p' | '720p' | 'audio'
      
      await page.addScriptTag({
        url: `https://www.nicozon.net/js/bookmarklet_old_${quality}.js`,
      });
      await page.waitForTimeout(5000);

      const downloadedFilePath = await this.downloadVideo(page, context, videoId);

      await this.publishProgress(jobId, {
        step: 'uploading_s3',
        percentage: 70,
        message: 'S3 にアップロード中...',
      });

      const fileName = `${videoId}_${Date.now()}.mp4`;
      const s3Key = this.s3Storage.buildS3Key(fileName);
      await this.s3Storage.uploadFile(downloadedFilePath, s3Key);

      const s3Url = await this.s3Storage.generatePresignedUrl(s3Key);
      const fileSize = fs.statSync(downloadedFilePath).size;

      fs.unlinkSync(downloadedFilePath);

      const result: NicovideoDownloadJobResult = {
        jobId,
        videoId,
        fileName,
        s3Key,
        s3Url,
        fileSize,
        commentCount: 0,
        completedAt: new Date(),
      };

      // ダウンロード完了イベントを SSE 経由で送信（署名付き URL 付き）
      await this.publishDownloadComplete(jobId, {
        step: 'completed',
        percentage: 100,
        message: 'ダウンロード完了',
        downloadUrl: s3Url,
        fileName,
        fileSize,
      });

      await context.close();
      if (this.browser) await this.browser.close();

      // クリーンアップ: 一時ファイルを削除
      await this.cleanupTempDirectory(path.join('./temp-downloads', videoId));

      return result;
    } catch (error) {
      this.logger.error(`ニコ動ダウンロード失敗: ${videoId}`, error as Error);
      if (this.browser) await this.browser.close();
      
      // エラー時もクリーンアップ
      await this.cleanupTempDirectory(path.join('./temp-downloads', videoId));
      
      throw error;
    }
  }

  /**
   * 一時ディレクトリをクリーンアップ
   */
  private async cleanupTempDirectory(dir: string): Promise<void> {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        this.logger.debug(`一時フォルダを削除: ${dir}`);
      }
    } catch (error) {
      this.logger.warn(`一時フォルダ削除失敗: ${dir}`, error as Error);
    }
  }

  private async downloadVideo(page: Page, context: any, videoId: string): Promise<string> {
    try {
      const tempDir = path.join('./temp-downloads', videoId);
      const downloadPath = path.join(tempDir, 'downloads');
      
      if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
      }

      this.logger.info(`ブックマークレット実行: ${videoId}`);

      // Playwright のダウンロードイベントを待機
      const downloadPromise = context.waitForEvent('download');

      // ブックマークレットスクリプト実行（ダウンロード開始）
      await page.evaluate(() => {});

      // ダウンロード完了を待機（タイムアウト: 15分）
      const download = await Promise.race([
        downloadPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ダウンロード待機タイムアウト (900秒)')), 900000)
        )
      ]) as any;

      // ダウンロードファイルを保存
      const fileName = await download.suggestedFilename();
      const downloadPath2 = path.join(downloadPath, fileName);
      await download.saveAs(downloadPath2);

      this.logger.info(
        `動画DL完了: ${videoId} -> ${downloadPath2} (${fs.statSync(downloadPath2).size} bytes)`, 
        { videoId, fileName, fileSize: fs.statSync(downloadPath2).size }
      );

      return downloadPath2;
    } catch (error) {
      this.logger.error(`動画DL失敗: ${videoId}`, error as Error, { videoId });
      throw error;
    }
  }



  /**
   * ダウンロードフォルダを取得（Docker コンテナ専用）
   */
  private getDownloadDirectory(): string {
    const downloadDir = '/tmp/nicovideo-downloads';
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    return downloadDir;
  }

  private async publishProgress(
    jobId: string,
    progress: Omit<NicovideoDownloadProgress, 'timestamp'>,
  ): Promise<void> {
    try {
      await this.redis.publish(
        `nicovideo-download:${jobId}`,
        JSON.stringify({
          jobId,
          type: 'progress',
          progress: { ...progress, timestamp: new Date() },
        }),
      );
    } catch (error) {
      this.logger.error(`進捗発行失敗: ${jobId}`, error as Error);
    }
  }

  /**
   * ダウンロード完了イベントを発行（署名付き URL 付き）
   */
  private async publishDownloadComplete(
    jobId: string,
    data: any,
  ): Promise<void> {
    try {
      await this.redis.publish(
        `nicovideo-download:${jobId}`,
        JSON.stringify({
          jobId,
          type: 'completed',
          data: {
            ...data,
            timestamp: new Date(),
          },
        }),
      );
      this.logger.info(`ダウンロード完了イベント発行: ${jobId}`, { jobId });
    } catch (error) {
      this.logger.error(`ダウンロード完了イベント発行失敗: ${jobId}`, error as Error);
    }
  }
}
