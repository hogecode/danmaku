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

      const context = await this.browser.newContext({ bypassCSP: true });
      const page = await context.newPage();
      
      await this.publishProgress(jobId, {
        step: 'accessing_nicovideo',
        percentage: 10,
        message: 'ニコ動にアクセス中...',
      });

      const videoUrl = `https://ext.nicovideo.jp/?${videoId}`;
      await page.goto(videoUrl, { waitUntil: 'networkidle' });

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

      const downloadedFilePath = await this.downloadVideo(page, videoId);

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

      await this.publishProgress(jobId, {
        step: 'completed',
        percentage: 100,
        message: 'ダウンロード完了',
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

  private async downloadVideo(page: Page, videoId: string): Promise<string> {
    try {
      const downloadDir = this.getDownloadDirectory();
      const tempDir = path.join('./temp-downloads', videoId);
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // ブックマークレット実行前のファイル一覧取得
      const beforeFiles = new Set(
        fs.readdirSync(downloadDir).map((f) => f.toLowerCase())
      );

      this.logger.info(`ブックマークレット実行: ${videoId}`);

      // ブックマークレットスクリプト実行（自動でダウンロード開始）
      await page.evaluate(() => {
        // ブックマークレットが自動実行されるのを想定
        // または必要に応じてボタンクリック
      });

      // ダウンロード完了を待機（新規ファイル出現 + サイズ安定）
      const downloadedFile = await this.waitForDownloadComplete(
        downloadDir,
        beforeFiles,
        videoId
      );

      if (!downloadedFile) {
        throw new Error(`動画ファイルが見つかりません (${videoId})`);
      }

      // ダウンロード完了ファイルを一時フォルダにコピー
      const sourcePath = path.join(downloadDir, downloadedFile);
      const destPath = path.join(tempDir, downloadedFile);
      
      fs.copyFileSync(sourcePath, destPath);

      this.logger.info(
        `動画DL完了: ${videoId} -> ${destPath} (${fs.statSync(destPath).size} bytes)`
      );

      return destPath;
    } catch (error) {
      this.logger.error(`動画DL失敗: ${videoId}`, error as Error);
      throw error;
    }
  }

  /**
   * ダウンロード完了を待機
   * 新規ファイル出現 + ファイルサイズが安定するまで待機
   */
  private async waitForDownloadComplete(
    downloadDir: string,
    beforeFiles: Set<string>,
    videoId: string,
    timeoutMs: number = 300000 // 5分
  ): Promise<string | null> {
    const startTime = Date.now();
    const checkInterval = 500; // 500ms ごとにチェック
    const stabilityCheck = 3000; // ファイルサイズが 3秒間変わらなければ完了と判定
    let lastSize = 0;
    let stableCount = 0;
    const stableThreshold = stabilityCheck / checkInterval;

    while (Date.now() - startTime < timeoutMs) {
      const currentFiles = fs.readdirSync(downloadDir);
      
      // 新規ファイルを検出
      const newFiles = currentFiles.filter(
        (f) => !beforeFiles.has(f.toLowerCase())
      );

      if (newFiles.length > 0) {
        // 最初の新規ファイル（複数ある場合は最大サイズ）
        const newFile = newFiles
          .map((f) => ({
            name: f,
            size: fs.statSync(path.join(downloadDir, f)).size,
          }))
          .sort((a, b) => b.size - a.size)[0];

        const currentSize = newFile.size;

        // ファイルサイズが安定しているか確認
        if (currentSize > 0 && currentSize === lastSize) {
          stableCount++;

          if (stableCount >= stableThreshold) {
            this.logger.info(
              `ダウンロード完了検知: ${newFile.name} (${currentSize} bytes)`
            );
            return newFile.name;
          }
        } else {
          stableCount = 0;
        }

        lastSize = currentSize;
      }

      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    // タイムアウト
    throw new Error(
      `ダウンロードタイムアウト: ${videoId} (${timeoutMs}ms以内に完了しませんでした)`
    );
  }

  /**
   * OS別ダウンロードフォルダを取得
   */
  private getDownloadDirectory(): string {
    const platform = process.platform;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~';

    if (platform === 'win32') {
      // Windows: C:\Users\{user}\Downloads
      return path.join(homeDir, 'Downloads');
    } else if (platform === 'darwin') {
      // macOS: ~/Downloads
      return path.join(homeDir, 'Downloads');
    } else {
      // Linux: ~/Downloads
      return path.join(homeDir, 'Downloads');
    }
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
}
