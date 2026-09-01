import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NicovideoApiClient } from '../utils/nicovideo-api.client';
import { NicovideConstants } from '../constants/nicovideo.constants';
import { NicovideVideoMetadata } from '../types/nicovideo.types';
import * as cheerio from 'cheerio';

/**
 * ニコ動 動画サービス
 * セッション不要 - ログインなしでも公開動画情報取得可能
 */
@Injectable()
export class NicovideVideoService {
  private readonly logger = new Logger(NicovideVideoService.name);

  constructor(
    private readonly apiClient: NicovideoApiClient,
  ) {}

  /**
   * 動画情報を取得
   * @param videoId - ビデオID
   * セッション不要 - ログインなしで公開動画情報取得可能
   * 
   * main.py Line 1130-1145 と同じ処理
   */
  async getVideoMetadata(
    videoId: string,
  ): Promise<NicovideVideoMetadata> {
    try {
      this.logger.log(`動画情報取得: ${videoId}`);

      const videoUrl = NicovideConstants.VIDEO_WATCH_URL.replace('{0}', videoId);
      this.logger.log(`ビデオURL: ${videoUrl}`);
      
      // main.py と同じ cookies を設定（watch_flash=0 で HTML5 プレイヤー）
      const cookies = { watch_flash: '0' };
      this.logger.log(`Cookies: ${JSON.stringify(cookies)}`);
      
      const html = await this.apiClient.getHtml(videoUrl, cookies);
      this.logger.log(`HTML取得成功: ${html.length} bytes`);

      const $ = cheerio.load(html);
      const scriptTag = $('meta[name="server-response"]');

      if (!scriptTag.length) {
        this.logger.warn(`server-response メタタグが見つかりません。HTMLの最初100文字: ${html.substring(0, 100)}`);
        throw new BadRequestException('動画情報が取得できません');
      }

      const serverResponse = JSON.parse(scriptTag.attr('content') || '{}');
      const response = serverResponse.data?.response;

      // console.log(`解析したサーバーレスポンス:`, serverResponse);
      if (!response) {
        throw new BadRequestException('メタデータが抽出できません');
      }

      const video = response.video || {};
      const commentInfo = response.comment || {};
      const nvComment = commentInfo.nvComment || {};
      
      // thread_key が取得できない場合、動画が非公開またはコメント機能が無効
      if (!nvComment.threadKey) {
        this.logger.warn(`ThreadKey not found for ${videoId} - comments may not be available`);
      }
      
      this.logger.debug(`API threads data: ${JSON.stringify(commentInfo.threads).substring(0, 300)}`);
      
      const metadata: NicovideVideoMetadata = {
        id: videoId,
        title: video.title || '',
        description: video.description || '',
        uploader: response.owner?.nickname || 'Unknown',
        uploaderId: response.owner?.id,
        duration: video.duration || 0,
        viewCount: video.count?.view || 0,
        commentCount: video.count?.comment || 0,
        mylistCount: video.count?.mylist || 0,
        likeCount: video.count?.like || 0,
        publishedAt: video.registeredAt || new Date().toISOString(),
        thumbnailUrl:
          video.thumbnail?.ogp ||
          video.thumbnail?.player ||
          video.thumbnail?.largeUrl ||
          '',
        tags: (response.tag?.items || []).map((tag: any) => tag.name),
        
        // コメント取得に必須のパラメータ
        // ✅ nvComment.params.targets を使用（完全な構造を持つ）
        threadKey: nvComment.threadKey || '',
        commentServer: nvComment.server || '',
        threads: nvComment.params?.targets || commentInfo.threads || [],  // params.targets を優先
        threadParams: nvComment.params,
      };

      return metadata;
    } catch (error) {
      this.logger.error(`動画情報取得エラー (${videoId}):`, error);
      throw error;
    }
  }
}
