import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { users } from './auth.schema';

// ============================================
// Provider Types Constant
// ============================================
export const PROVIDER_TYPES = {
  GDRIVE: 'gdrive',
  ONEDRIVE: 'onedrive',
  GITHUB: 'github',
} as const;

export type ProviderType = typeof PROVIDER_TYPES[keyof typeof PROVIDER_TYPES];

// Screenshots
export const screenshots = pgTable('screenshots', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  provider_type: varchar('provider_type', { length: 50 }).notNull(), // 'gdrive', 'onedrive', 'github'
  file_id: varchar('file_id', { length: 255 }).notNull(),
  timestamp_seconds: integer('timestamp_seconds').notNull(),
  image_url: varchar('image_url', { length: 512 }).notNull(),
  file_size: integer('file_size'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userIdIdx: index('idx_screenshots_user_id').on(t.user_id),
  fileIdIdx: index('idx_screenshots_file_id').on(t.file_id),
  providerTypeIdx: index('idx_screenshots_provider_type').on(t.provider_type),
}));

export type Screenshot = typeof screenshots.$inferSelect;
export type NewScreenshot = typeof screenshots.$inferInsert;


// Playlists
export const playlists = pgTable('playlists', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  thumbnail_url: varchar('thumbnail_url', { length: 512 }),
  is_public: boolean('is_public').default(false),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userIdIdx: index('idx_playlists_user_id').on(t.user_id),
}));

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;


// Playlist Items
export const playlistItems = pgTable('playlist_items', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  playlist_id: bigserial('playlist_id', { mode: 'bigint' }).notNull(),
  provider_type: varchar('provider_type', { length: 50 }).notNull(), // 'gdrive', 'onedrive', 'github'
  file_id: varchar('file_id', { length: 255 }).notNull(),
  position: integer('position').notNull(),
  added_at: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  playlistIdFk: foreignKey({ columns: [t.playlist_id], foreignColumns: [playlists.id] }).onDelete('cascade'),
  playlistIdIdx: index('idx_playlist_items_playlist_id').on(t.playlist_id),
  fileIdIdx: index('idx_playlist_items_file_id').on(t.file_id),
  providerTypeIdx: index('idx_playlist_items_provider_type').on(t.provider_type),
}));

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type NewPlaylistItem = typeof playlistItems.$inferInsert;


// Favorites
export const favorites = pgTable('favorites', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  provider_type: varchar('provider_type', { length: 50 }).notNull(), // 'gdrive', 'onedrive', 'github'
  file_id: varchar('file_id', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userProviderFileIdx: uniqueIndex('idx_favorites_user_provider_file').on(t.user_id, t.provider_type, t.file_id),
  userIdIdx: index('idx_favorites_user_id').on(t.user_id),
  providerTypeIdx: index('idx_favorites_provider_type').on(t.provider_type),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
