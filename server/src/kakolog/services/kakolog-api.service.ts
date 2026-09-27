import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';
import { LoggerService } from '../../common/logger/logger.service';
import type { KakologComment, KakologApiResponse } from '../types/kakolog.types';

/**
 * Kakolog (2ch実況ログ) API クライアント
 * 
 * Jikkyo API（https://jikkyo.tsukumijima.net）から
 * JSON/XML形式のコメントを取得して解析する
 */
@Injectable()
export class KakologApiService {
  private readonly client: AxiosInstance;
  private readonly baseUrl = 'https://jikkyo.tsukumijima.net/api/kakolog';

  constructor(private readonly logger: LoggerService) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'Danmaku-Player/1.0',
      },
    });

    // リクエスト送信前にURLをログ出力
    this.client.interceptors.request.use((config) => {
      // 完全なURLを構築
      const baseUrl = config.baseURL ?? this.baseUrl;
      const url = config.url ?? '';
      const fullUrl = baseUrl + url;
      const paramsStr = config.params
        ? '?' + new URLSearchParams(config.params).toString()
        : '';
      const completeUrl = fullUrl + paramsStr;

      this.logger.info('Kakolog API リクエスト送信', {
        method: config.method?.toUpperCase() || 'GET',
        url: completeUrl,
      });

      return config;
    });
  }

  /**
   * チャンネルの時間範囲内のコメントを取得
   *
   * @param channelId チャンネルID（例: "jk1"）
   * @param startTime 開始時刻（Unix timestamp）
   * @param endTime 終了時刻（Unix timestamp）
   * @returns Kakolog形式のコメント配列
   */
  async getComments(
    channelId: string,
    startTime: number,
    endTime: number,
  ): Promise<KakologApiResponse> {
    try {
      this.logger.debug('Kakolog API リクエスト開始', {
        channelId,
        startTime,
        endTime,
        duration: endTime - startTime,
      });

      // JSON形式で取得（JSON の方が扱いやすい）
      const response = await this.client.get(`/${channelId}`, {
        params: {
          starttime: startTime,
          endtime: endTime,
          format: 'json',
        },
      });

      this.logger.debug('Kakolog API レスポンス受信', {
        status: response.status,
        dataType: typeof response.data,
      });

      // JSONをパース
      const comments = this.parseCommentsFromJson(response.data);

      this.logger.info(`Kakolog コメント取得完了: ${comments.length}件`, {
        channelId,
        commentCount: comments.length,
      });

      return {
        comments,
        total: comments.length,
        retrieved: comments.length,
      };
    } catch (error) {
      this.logger.error(
        `Kakolog API エラー (${channelId}):`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * JSON形式のレスポンスからコメント情報を抽出
   *
   * Jikkyo APIのJSONレスポンス形式:
   * 1. 配列形式: [{ thread: "1234", no: 1, ... }, ...]
   * 2. packet形式: { packet: [{ chat: { thread: "1234", ... } }, ...] }
   *
   * @param data APIレスポンスのデータ
   * @returns KakologComment配列
   */
  private parseCommentsFromJson(data: any): KakologComment[] {
    const comments: KakologComment[] = [];

    try {
      let items: any[] = [];

      // packet 形式のチェック
      if (data?.packet && Array.isArray(data.packet)) {
        // { packet: [{ chat: {...} }, ...] } 形式
        items = data.packet
          .map((p: any) => p.chat)
          .filter((chat: any) => chat !== undefined);
      } else if (Array.isArray(data)) {
        // 配列形式: [{ thread: "1234", ... }, ...]
        items = data;
      } else if (data?.comments && Array.isArray(data.comments)) {
        // comments フィールド形式
        items = data.comments;
      }

      if (!Array.isArray(items) || items.length === 0) {
        this.logger.warn('JSON形式が予期しない形式です', { 
          dataType: typeof data,
          hasPacket: !!data?.packet,
          isArray: Array.isArray(data),
        });
        return [];
      }

      for (const item of items) {
        try {
          const comment = this.parseJsonComment(item);
          if (comment) {
            comments.push(comment);
          }
        } catch (err) {
          this.logger.warn('コメント解析エラー', { error: err, item });
        }
      }

      return comments;
    } catch (error) {
      this.logger.error('JSON解析エラー', error as Error);
      return [];
    }
  }

  /**
   * JSONオブジェクトを KakologComment に変換
   *
   * @param item JSONアイテム
   * @returns KakologComment または null
   */
  private parseJsonComment(item: any): KakologComment | null {
    try {
      // 最低限の必須フィールドをチェック
      if (!item.date && item.vpos === undefined) {
        return null;
      }

      // mail属性をパース（存在すれば）
      const mail = item.mail || '';

      return {
        thread: item.thread || '',
        no: parseInt(item.no ?? '0', 10),
        vpos: parseInt(item.vpos ?? '0', 10),
        date: parseInt(item.date ?? '0', 10),
        dateUsec: item.date_usec,
        mail: mail.length > 0 ? mail : undefined,
        userId: item.user_id,
        premium: item.premium ? parseInt(item.premium, 10) : undefined,
        anonymity: item.anonymity ? parseInt(item.anonymity, 10) : undefined,
        text: item.content || item.text || '',
      };
    } catch (error) {
      this.logger.warn('JSONアイテムの解析に失敗', { error, item });
      return null;
    }
  }
}
