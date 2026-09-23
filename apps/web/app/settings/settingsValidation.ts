import { z } from 'zod';

/**
 * ユーザー設定フォームのバリデーションスキーマ
 * 
 * スキーマフィールド:
 * - theme: 'light' | 'dark'
 * - language: 'jp' | 'en'
 * - danmaku_max_count: 1-10000
 * - ng_words_reg: string[] (正規表現配列)
 */
const baseSchema = z.object({
  // Display Settings
  theme: z.enum(['light', 'dark'] as const, {
    message: 'テーマは「light」または「dark」である必要があります',
  }),
  
  language: z.enum(['jp', 'en'] as const, {
    message: '言語は「jp」または「en」である必要があります',
  }),

  // Danmaku Settings
  danmaku_max_count: z
    .number()
    .int()
    .min(1, '最小1以上である必要があります')
    .max(10000, '最大表示数は 10000 以下である必要があります'),

  // NG Word Settings
  ng_words_reg: z.array(
    z.string().trim().min(1, '空の正規表現は許可されません')
  ),
});

// フォーム用スキーマ（optional + デフォルト値）
export const settingsFormSchema = baseSchema.partial().transform(data => ({
  theme: data.theme || 'light',
  language: data.language || 'jp',
  danmaku_max_count: data.danmaku_max_count || 1000,
  ng_words_reg: (data.ng_words_reg || []).filter(v => v.length > 0),
}));

/**
 * 型定義
 */
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
