import { Injectable } from '@nestjs/common';
import { CommentDto } from '../dto';
import { DPlayerCommentDto } from '../dto/dplayer-comment.dto';

/**
 * ニコニコ実況形式 CommentDto を DPlayer 互換形式に変換
 * 
 * @see Go実装参考: chatXMLToApiComment
 * @see DPlayer形式: https://dplayer.js.org/
 */
@Injectable()
export class CommentConverter {
  /**
   * CommentDto (XML/JSON) を DPlayerCommentDto に変換
   * 
   * @param comment - ニコニコ実況形式コメント
   * @returns DPlayer 互換コメント
   */
  convertCommentToDPlayer(comment: CommentDto): DPlayerCommentDto {
    // 1. vpos (10ミリ秒単位) → time (秒単位の浮動小数点数)
    const time = this.vposToSeconds(comment.vpos);

    // 2. mail フィールドからコメント表示スタイルを解析
    const { type, size, color } = this.parseMailAttribute(comment.mail || '');

    // 3. 匿名フラグをチェック
    const author = this.getAuthor(comment);

    return {
      time,
      type,
      size,
      color,
      author,
      text: comment.text,
    };
  }

  /**
   * CommentDto 配列を DPlayerCommentDto 配列に変換
   * 
   * @param comments - ニコニコ実況形式コメント配列
   * @returns DPlayer 互換コメント配列
   */
  convertCommentsToDPlayer(comments: CommentDto[]): DPlayerCommentDto[] {
    return comments.map(comment => this.convertCommentToDPlayer(comment));
  }

  /**
   * vpos (10ミリ秒単位) を秒単位の浮動小数点数に変換
   * 
   * @param vpos - vpos値（10ミリ秒単位）
   * @returns 秒単位の浮動小数点数
   */
  private vposToSeconds(vpos: number): number {
    return vpos / 100.0;
  }

  /**
   * mail フィールドからコメント表示スタイルを解析
   * 
   * mail フォーマット例:
   * - "184" → 匿名コメント（常に表示）
   * - "big" → 大きいサイズ
   * - "ue" / "top" → 上部表示
   * - "shita" / "bottom" → 下部表示
   * - "184 big ue" → 複合指定
   * - "#ff0000" → 色指定（ただし多くはmail フィールドに含まれない）
   * 
   * @param mail - mail 属性
   * @returns { type, size, color }
   */
  private parseMailAttribute(mail: string): {
    type: string;
    size: string;
    color: string;
  } {
    const parts = mail.toLowerCase().split(/\s+/);

    let type = 'normal'; // デフォルト: 中央スクロール
    let size = 'normal'; // デフォルト: 通常サイズ
    let color = '#ffffff'; // デフォルト: 白

    for (const part of parts) {
      // コメント位置
      if (part === 'ue' || part === 'top') {
        type = 'top';
      } else if (part === 'shita' || part === 'bottom') {
        type = 'bottom';
      }
      // コメントサイズ
      else if (part === 'big') {
        size = 'big';
      } else if (part === 'small') {
        size = 'small';
      }
      // カラーコード（#RRGGBB または 16進数）
      else if (part.startsWith('#')) {
        color = part;
      } else if (/^[0-9a-f]{6}$/i.test(part)) {
        color = `#${part}`;
      }
      // その他: 184（匿名）など無視
    }

    return { type, size, color };
  }

  /**
   * コメント投稿者を取得
   * 
   * - anonymity === 1 の場合は null（匿名）
   * - user_id がない場合は null
   * - それ以外は user_id を返す
   * 
   * @param comment - コメント
   * @returns 投稿者ID または null
   */
  private getAuthor(comment: CommentDto): string | null {
    // 匿名投稿の場合
    if (comment.anonymity === 1) {
      return null;
    }

    // user_id がある場合は返す
    if (comment.user_id) {
      return comment.user_id;
    }

    return null;
  }
}
