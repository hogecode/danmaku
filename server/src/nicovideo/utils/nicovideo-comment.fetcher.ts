import { Injectable, Logger } from '@nestjs/common';
import { NicovideoApiClient } from './nicovideo-api.client';
import { NicovideConstants } from '../constants/nicovideo.constants';
import {
  NicovideComment,
  NicovideCommentThread,
  CommentsData,
} from '../types/nicovideo.types';
import { parseStringPromise } from 'xml2js';

/**
 * ニコ動 コメント取得ユーティリティ
 */
@Injectable()
export class NicovideCommentFetcher {
  private readonly logger = new Logger(NicovideCommentFetcher.name);

  constructor(private readonly apiClient: NicovideoApiClient) {}

  /**
   * コメント取得
   * threads: ニコ動APIから取得した完全な構造を持つthreads配列
   */
  async fetchComments(
    videoId: string,
    commentServer: string,
    threadKey: string,
    threads: any[],  // ニコ動APIの完全なthreads構造（id, fork, forkLabel, videoId, isActive等）
    language: string,
    commentsFrom?: number,
    commentsLimit?: number,
  ): Promise<CommentsData> {
    const commentsData: CommentsData = {
      globalComments: {
        retrievedCount: 0,
        commentCount: 0,
      },
      threads: [],
    };

    const fromTime = commentsFrom || Math.floor(Date.now() / 1000);
    const limit = commentsLimit || NicovideConstants.COMMENTS_LIMIT_DEFAULT_N;

    try {
      // 複数スレッドを一度に取得（APIは複数スレッドのtargetsをサポート）
      const allThreadsData = await this.fetchCommentThread(
        commentServer,
        threadKey,
        threads,  // 複数スレッドを一度に送信
        language,
        fromTime,
        limit,
      );
      commentsData.threads = allThreadsData;
      commentsData.globalComments.retrievedCount = allThreadsData.reduce(
        (sum, t) => sum + t.retrievedCount,
        0,
      );
    } catch (error) {
      this.logger.error(`コメント取得処理失敗:`, error);
    }

    return commentsData;
  }

  /**
   * スレッド単位でコメント取得
   * 複数スレッドをサポート（APIのtargetsで複数指定可能）
   */
  private async fetchCommentThread(
    commentServer: string,
    threadKey: string,
    threads: any[],  // ニコ動APIの完全なthreads構造
    language: string,
    commentsFrom: number,
    commentsLimit: number,
  ): Promise<NicovideCommentThread[]> {
    const threadsData: NicovideCommentThread[] = [];

    let hasMore = true;
    let totalRetrievedCount = 0;

    // API呼び出しループ（複数スレッドを一度に取得）
    while (hasMore && totalRetrievedCount < commentsLimit) {
      try {
        const apiUrl = NicovideConstants.COMMENTS_THREAD_URL.replace('{0}', commentServer) + '?pc=1';
        
        // リクエストボディ：複数スレッドをtargetsで指定
        const requestBody = {
          params: {
            language: language,
            targets: threads,  // ✅ 複数スレッドを一度に送信
          },
          threadKey: threadKey,
          additionals: {
            // res_from と when は不要の可能性がある
          },
        };

        // this.logger.log(`コメントAPI リクエスト - URL: ${apiUrl}`);
        // this.logger.log(`コメントAPI リクエストボディ: ${JSON.stringify(requestBody).substring(0, 150)}`);

        const response = await this.apiClient.post<any>(
          apiUrl,
          requestBody,
          {
            headers: {
              'content-type': 'text/plain;charset=UTF-8',
              'x-client-os-type': 'others',
            },
          },
        );
        
        this.logger.log(`コメントAPI レスポンス成功 - ステータス: ${response.meta?.status}`);

        // API エラー処理
        if (response.meta?.errorCode) {
          this.logger.error(`コメント API エラー: ${response.meta.errorCode}`);

          if (response.meta.errorCode === 'TOO_MANY_REQUESTS') {
            await this.sleep(NicovideConstants.COMMENTS_THREAD_COOLDOWN_S * 1000);
            continue;
          }

          if (response.meta.errorCode === 'EXPIRED_TOKEN') {
            this.logger.warn('スレッドキー有効期限切れ');
            break;
          }

          if (response.meta.errorCode === 'INVALID_TOKEN') {
            this.logger.error('無効なトークン');
            break;
          }

          break;
        }

        // ✅ 複数スレッドのコメントを処理
        const threadResponses = response.data?.threads || [];
        if (threadResponses.length === 0) {
          break;
        }

        // 各スレッドのコメント取得
        for (const thread_response of threadResponses) {
          const thread = threads.find((t) => t.fork === thread_response.fork);
          if (!thread) continue;

          const threadData: NicovideCommentThread = {
            id: thread_response.id,
            fork: thread_response.fork,
            comments: [],
            retrievedCount: 0,
          };

          const comments = thread_response.comments || [];

          // コメント情報を整形
          for (const comment of comments) {
            if (totalRetrievedCount >= commentsLimit) {
              hasMore = false;
              break;
            }

            // ✅ vposMs を使用（レスポンスフォーマットに合わせる）
            const normalizedComment: NicovideComment = {
              id: comment.id,
              no: comment.no,
              vpos: comment.vposMs || 0,  // vposMs (milliseconds)
              date: Math.floor(new Date(comment.postedAt).getTime() / 1000),  // UNIX timestamp
              mail: comment.commands?.join(' ') || '',  // commands を mail 互換フィールドに
              user_id: comment.userId,
              premium: comment.isPremium ? 1 : 0,  // boolean を 0/1 に変換
              anonymity: comment.commands?.includes('184') ? 1 : 0,  // 184 コマンドを anonymity に変換
              text: comment.body,
              fork: thread_response.fork,
              postedAt: comment.postedAt,
            };

            threadData.comments.push(normalizedComment);
            totalRetrievedCount++;
          }

          threadData.commentCount = thread_response.commentCount;
          threadData.retrievedCount = threadData.comments.length;
          threadsData.push(threadData);
        }

        // 次の取得用に commentsFrom を更新
        if (hasMore && threadResponses.length > 0) {
          const lastCommentInLastThread = threadResponses[threadResponses.length - 1].comments?.[0];
          if (lastCommentInLastThread) {
            await this.sleep(NicovideConstants.COMMENTS_THREAD_INTERVAL_S * 1000);
            commentsFrom = Math.floor(
              new Date(lastCommentInLastThread.postedAt).getTime() / 1000,
            );
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        this.logger.error('コメント取得エラー:', error);
        break;
      }
    }

    return threadsData;
  }

  /**
   * XML コメント解析
   */
  async parseCommentsXml(xmlString: string): Promise<NicovideComment[]> {
    try {
      const result = await parseStringPromise(xmlString);
      const comments: NicovideComment[] = [];

      if (result.packet?.chat) {
        const chats = Array.isArray(result.packet.chat)
          ? result.packet.chat
          : [result.packet.chat];

        for (const chat of chats) {
          const comment: NicovideComment = {
            vpos: parseInt(chat.$.vpos || '0'),
            date: parseInt(chat.$.date || '0'),
            mail: chat.$.mail,
            user_id: chat.$.user_id,
            premium: chat.$.premium ? parseInt(chat.$.premium) : undefined,
            anonymity: chat.$.anonymity ? parseInt(chat.$.anonymity) : undefined,
            text: chat._ || '',
          };
          comments.push(comment);
        }
      }

      return comments;
    } catch (error) {
      this.logger.error('XML解析エラー:', error);
      throw error;
    }
  }

  /**
   * スリープ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
