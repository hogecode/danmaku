import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { NicovideoConstants as NicovideoConstants } from '../constants/nicovideo.constants';

/**
 * ニコ動 API クライアント
 * HTTP 通信を担当
 * セッション不要 - ログインなしで公開動画情報取得可能
 */
@Injectable()
export class NicovideoApiClient {
  private readonly logger = new Logger(NicovideoApiClient.name);
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': `${NicovideoConstants.MODULE_NAME}/${NicovideoConstants.VERSION}`,
        ...NicovideoConstants.API_HEADERS,
      },
      withCredentials: true,
    });

    // レスポンスインターセプター
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error(`API Error: ${error.message}`, error.response?.status);
        throw error;
      },
    );
  }



  /**
   * GET リクエスト
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.httpClient.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.logger.error(`GET ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * POST リクエスト
   */
  async post<T>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<T> {
    try {
      const response = await this.httpClient.post<T>(url, data, {
        ...config,
        headers: {
          ...NicovideoConstants.API_HEADERS,
          ...(config?.headers || {}),
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`POST ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * HEAD リクエスト（ファイルサイズ取得用）
   */
  async head(url: string): Promise<any> {
    try {
      const response = await this.httpClient.head(url);
      return response.headers;
    } catch (error) {
      this.logger.error(`HEAD ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * ストリーム取得
   */
  async getStream(url: string) {
    try {
      return this.httpClient.get(url, {
        responseType: 'stream',
      });
    } catch (error) {
      this.logger.error(`Stream GET ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * HTML ページを取得
   * main.py Line 1141 と同じ処理
   */
  async getHtml(url: string, cookies?: Record<string, string>): Promise<string> {
    try {
      const config: any = {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
          'Referer': 'https://www.nicovideo.jp/',
          'Upgrade-Insecure-Requests': '1',
        },
      };

      // Cookies を設定（watch_flash, lang など）
      if (cookies && Object.keys(cookies).length > 0) {
        const cookieString = Object.entries(cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        config.headers['Cookie'] = cookieString;
        this.logger.log(`HTMLリクエスト - URL: ${url}, Cookie: ${cookieString}`);
      } else {
        this.logger.log(`HTMLリクエスト - URL: ${url}`);
      }

      const response = await this.httpClient.get(url, config);
      this.logger.log(`HTMLリクエスト成功 - ステータス: ${response.status}, サイズ: ${response.data.length}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`HTML GET ${url} failed - ステータス: ${error.response?.status}, メッセージ: ${error.message}`);
      throw error;
    }
  }
}
