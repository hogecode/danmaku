import { bigint, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

/**
 * ニコ動認証トークン保存テーブル
 * ユーザーごとのセッション情報を管理
 */
export const nicovideo_auth_tokens = pgTable('nicovideo_auth_tokens', {
  id: bigint('id', { mode: 'bigint' }).primaryKey().generatedAlwaysAsIdentity(),
  user_id: bigint('user_id', { mode: 'bigint' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  session_cookie: text('session_cookie').notNull(), // user_session クッキー
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type NicovideoAuthToken = typeof nicovideo_auth_tokens.$inferSelect;
export type NicovideoAuthTokenInsert = typeof nicovideo_auth_tokens.$inferInsert;
