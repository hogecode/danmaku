/**
 * Kakolog コメント → DPlayer 形式への変換ユーティリティ
 *
 * Kakolog形式:
 * - vpos: コメント投稿時刻（Unix timestamp）
 * - date: コメント投稿時刻（Unix timestamp）
 * - mail: コメント属性（"big red ue" など）
 * - userId: ユーザーID（匿名の場合は省略）
 * - anonymity: 匿名フラグ（1=匿名）
 *
 * DPlayer 形式:
 * - time: 秒単位の浮動小数点数
 * - type: "normal", "top"/"ue", "bottom"/"shita"
 * - size: "small", "medium", "big"
 * - color: 色番号（例: "184"）
 * - author: 投稿者ID（匿名の場合は null）
 * - text: コメント内容
 */

import type { KakologComment } from '../types/kakolog.types';
import type { KakologCommentDto } from '../dto/comment-response.dto';

/**
 * mail属性をパースして DPlayer の type と size に変換
 * ニコ動と同じフォーマットを想定
 *
 * @param mail mail属性（例: "184"、"big red ue"）
 * @returns { type, size, color }
 */
function parseMailAttribute(mail?: string): {
  type: 'normal' | 'top' | 'bottom';
  size: 'small' | 'medium' | 'big';
  color: string;
} {
  let type: 'normal' | 'top' | 'bottom' = 'normal';
  let size: 'small' | 'medium' | 'big' = 'medium';
  let color = '184'; // デフォルト色番号

  if (!mail) {
    return { type, size, color };
  }

  const parts = mail.toLowerCase().split(/\s+/);

  for (const part of parts) {
    // コメント位置
    if (part === 'ue' || part === 'top') {
      type = 'top';
    } else if (part === 'shita' || part === 'bottom') {
      type = 'bottom';
    } else if (part === 'naka' || part === 'normal') {
      type = 'normal';
    }

    // サイズ
    if (part === 'big') {
      size = 'big';
    } else if (part === 'small') {
      size = 'small';
    }

    // 色番号（3桁以下の数字）
    if (part.match(/^\d{1,3}$/)) {
      color = part;
    }
  }

  return { type, size, color };
}

/**
 * Kakolog形式からDPlayer形式に変換
 *
 * @param kakologComment Kakologコメント
 * @param startTime 基準時刻（秒単位での相対位置を計算）
 * @returns DPlayer形式のコメント
 */
export function convertKakologCommentToDPlayer(
  kakologComment: KakologComment,
  startTime: number,
): KakologCommentDto {
  // Unix timestampから相対秒数を計算
  const timeInSeconds = kakologComment.date - startTime;

  // mail属性をパース
  const { type, size, color } = parseMailAttribute(kakologComment.mail);

  // 匿名チェック
  const author =
    kakologComment.anonymity === 1 ? null : kakologComment.userId || null;

  return {
    time: timeInSeconds,
    type,
    size,
    color,
    author,
    text: kakologComment.text,
  };
}

/**
 * Kakolog コメント配列を DPlayer 形式に一括変換
 *
 * @param kakologComments Kakolog コメント配列
 * @param startTime 基準時刻（相対秒数を計算するため）
 * @returns DPlayer形式のコメント配列
 */
export function convertKakologCommentsToDPlayer(
  kakologComments: KakologComment[],
  startTime: number,
): KakologCommentDto[] {
  return kakologComments
    .map((comment) => {
      try {
        return convertKakologCommentToDPlayer(comment, startTime);
      } catch (error) {
        console.error(
          `[convertKakologCommentsToDPlayer] Error converting comment:`,
          error,
          comment,
        );
        return null;
      }
    })
    .filter((comment): comment is KakologCommentDto => comment !== null);
}
