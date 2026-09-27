/**
 * ニコ動コメント → DPlayer 形式への変換ユーティリティ
 * 
 * ニコ動形式:
 * - vpos: 動画開始からの経過時間（1000倍）例: 921630 = 921.63秒
 * - date: Unix timestamp
 * - mail: コメント属性（"184"など）
 * - premium: プレミアム会員フラグ（1=プレミアム）
 * - anonymity: 匿名フラグ（1=匿名）
 * 
 * DPlayer 形式:
 * - time: 秒単位の浮動小数点数（例: 10.5）
 * - type: "normal", "top"/"ue", "bottom"/"shita"
 * - size: "small", "medium"/"", "big"
 * - color: 16進数カラーコード（例: "#ffffff"）
 * - author: 投稿者ID（匿名の場合は null）
 * - text: コメント内容
 */

import type { NicovideoComment } from '../types/nicovideo.types';
import type { DPlayerCommentDto } from '../dto/download-comment-response.dto';

/**
 * ニコ動のmail属性をパースして DPlayer の type と size に変換
 * 
 * color は文字列（ニコ動の色番号）で返す
 * フロントエンド側で CommentUtils.getCommentColor() で色を処理する
 * 
 * @param mail ニコ動のmail属性（例: "184"、"184 big ue"）
 * @returns { type, size, color }
 */
function parseMailAttribute(mail?: string): {
  type: string;
  size: string;
  color: string; // 文字列として返す（フロントエンドで処理）
} {
  const defaultResult = {
    type: 'right',
    size: 'medium',
    color: '184', // デフォルト色番号（文字列）
  };

  if (!mail) {
    return defaultResult;
  }

  const parts = mail.toLowerCase().split(/\s+/);
  const result = { ...defaultResult };

  for (const part of parts) {
    // コメント位置
    if (part === 'ue' || part === 'top') {
      result.type = 'top';
    } else if (part === 'shita' || part === 'bottom') {
      result.type = 'bottom';
    } else if (part === 'naka' || part === 'normal') {
      result.type = 'normal';
    }

    // サイズ
    if (part === 'big') {
      result.size = 'big';
    } else if (part === 'small') {
      result.size = 'small';
    }

    // 色番号（3桁の数字）
    // ニコ動形式は色番号で "184" などの形式
    if (part.match(/^\d{1,3}$/)) {
      // 色番号（例: "184"）を文字列として設定
      result.color = part;
    }
  }

  return result;
}

/**
 * ニコ動形式からDPlayer形式に変換
 * 
 * @param nicoComment ニコ動コメント
 * @returns DPlayer形式のコメント
 */
export function convertNicovideoCommentToDPlayer(
  nicoComment: NicovideoComment,
): DPlayerCommentDto {
  // vpos は 1000倍されているため、秒単位に変換
  const timeInSeconds = nicoComment.vpos / 1000;

  // mail 属性をパース
  const { type, size, color } = parseMailAttribute(nicoComment.mail);

  // 匿名チェック
  const author =
    nicoComment.anonymity === 1
      ? null
      : nicoComment.user_id;

  return {
    time: timeInSeconds,
    type,
    size,
    color,
    author: author || null,
    text: nicoComment.text,
  };
}

/**
 * ニコ動コメント配列を DPlayer 形式に一括変換
 * 
 * @param nicoComments ニコ動コメント配列
 * @returns DPlayer形式のコメント配列
 */
export function convertNicovideoCommentsToDPlayer(
  nicoComments: NicovideoComment[],
): DPlayerCommentDto[] {
  return nicoComments
    .map((comment) => {
      try {
        return convertNicovideoCommentToDPlayer(comment);
      } catch (error) {
        console.error(
          `[convertNicovideoCommentsToDPlayer] Error converting comment:`,
          error,
          comment
        );
        return null;
      }
    })
    .filter((comment): comment is DPlayerCommentDto => comment !== null);
}
