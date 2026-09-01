import { Injectable, BadRequestException } from '@nestjs/common';
import * as xml2js from 'xml2js';
import { CommentDto } from '../dto';
import { PlayerConstants } from '../constants/player.constants';

/**
 * XML/JSON コメントパーサー
 */
@Injectable()
export class XmlParser {
  private readonly xmlParser = new xml2js.Parser();

  /**
   * XML コメントを JSON に変換
   * <packet><chat ... >text</chat></packet> → CommentDto[]
   * @param xmlContent - XML文字列
   * @returns パースされたコメント配列
   */
  async parseXmlComments(xmlContent: string): Promise<CommentDto[]> {
    try {
      const parsed = await this.xmlParser.parseStringPromise(xmlContent);
      const chats = parsed.packet?.chat || [];

      // chat が単一要素の場合は配列に変換
      const chatArray = Array.isArray(chats) ? chats : [chats];

      return chatArray.map((chat: any) => {
        const commentText = Array.isArray(chat._) ? chat._[0] : chat._;
        return {
          thread: chat.$?.thread,
          no: chat.$?.no ? parseInt(chat.$.no, 10) : 0,
          vpos: chat.$?.vpos ? parseInt(chat.$.vpos, 10) : 0,
          date: chat.$?.date ? parseInt(chat.$.date, 10) : 0,
          mail: chat.$?.mail,
          user_id: chat.$?.user_id,
          premium: chat.$?.premium ? parseInt(chat.$.premium, 10) : undefined,
          anonymity: chat.$?.anonymity
            ? parseInt(chat.$.anonymity, 10)
            : undefined,
          text: commentText || '',
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `XML パースエラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * JSON コメントをバリデーション
   * @param jsonContent - JSON文字列
   * @returns バリデーション済みコメント配列
   */
  parseJsonComments(jsonContent: string): CommentDto[] {
    try {
      const data = JSON.parse(jsonContent);
      if (!Array.isArray(data)) {
        throw new BadRequestException('JSON must be an array of comments');
      }

      // 基本的なバリデーション
      return data.map((comment: any) => ({
        thread: comment.thread,
        no: comment.no || 0,
        vpos: comment.vpos || 0,
        date: comment.date || 0,
        mail: comment.mail,
        user_id: comment.user_id,
        premium: comment.premium,
        anonymity: comment.anonymity,
        text: comment.text || '',
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `JSON パースエラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * MIME タイプから自動判定してパース
   * @param fileContent - ファイル内容
   * @param mimeType - MIME タイプ
   * @returns パースされたコメント配列
   */
  async parseCommentFile(
    fileContent: string,
    mimeType: string,
  ): Promise<CommentDto[]> {
    if (mimeType === PlayerConstants.MIME_TYPES.XML) {
      return this.parseXmlComments(fileContent);
    } else if (mimeType === PlayerConstants.MIME_TYPES.JSON) {
      return this.parseJsonComments(fileContent);
    }
    throw new BadRequestException('Unsupported comment file format');
  }
}
