import {
  pgTable,
  bigserial,
  varchar,
  integer,
  text,
  timestamp,
  boolean,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

// User Sessions
export const userSessions = pgTable('user_sessions', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  device_type: varchar('device_type', { length: 50 }).notNull(),
  device_name: varchar('device_name', { length: 255 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  last_activity: timestamp('last_activity', { withTimezone: true }).defaultNow().notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userIdIdx: index('idx_user_sessions_user_id').on(t.user_id),
  lastActivityIdx: index('idx_user_sessions_last_activity').on(t.last_activity),
}));

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;


// User Settings
export const userSettings = pgTable('user_settings', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull().unique(),
  
  // Display Settings
  theme: varchar('theme', { length: 20 }).default('light'), // 'light', 'dark'
  language: varchar('language', { length: 10 }).default('jp'), // 'jp', 'en', etc
  
  // Playback Settings
  auto_play_next: boolean('auto_play_next').default(false),
  playback_speed: varchar('playback_speed', { length: 10 }).default('1.0'),
  
  // Danmaku (Comment) Settings
  danmaku_enabled: boolean('danmaku_enabled').default(true),
  danmaku_opacity: varchar('danmaku_opacity', { length: 5 }).default('1.0'), // 0.0 - 1.0
  danmaku_max_count: integer('danmaku_max_count').default(1000), // Maximum comments displayed
  danmaku_display_duration: integer('danmaku_display_duration').default(5000), // milliseconds
  
  // NG Word Settings
  ng_words_reg: text('ng_words_reg'), // JSON: ["word1", "word2", ...]
  
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
}));

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
