import {
  pgTable,
  bigserial,
  varchar,
  integer,
  text,
  jsonb,
  timestamp,
  boolean,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

// User Settings
export const userSettings = pgTable('user_settings', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull().unique(),
  
  // Display Settings
  theme: varchar('theme', { length: 20 }).default('light'), // 'light', 'dark'
  language: varchar('language', { length: 10 }).default('jp'), // 'jp', 'en', etc
    
  // Danmaku (Comment) Settings
  danmaku_max_count: integer('danmaku_max_count').default(1000), // Maximum comments displayed  
  // NG Word Settings
  ng_words_reg: jsonb('ng_words_reg')
    .$type<string[]>()
    .default([])
    .notNull(), // 正規表現配列: ["aaa|bbb", "ccc", "asd"]
  
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
}));

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
