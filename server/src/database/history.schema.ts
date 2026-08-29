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

// Playback History
export const playbackHistory = pgTable('playback_history', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  provider_type: varchar('provider_type', { length: 50 }).notNull(), // 'gdrive', 'onedrive', 'github'
  file_id: varchar('file_id', { length: 255 }).notNull(),
  position_seconds: integer('position_seconds'),
  duration_seconds: integer('duration_seconds'),
  is_completed: boolean('is_completed').default(false),
  watched_at: timestamp('watched_at', { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userProviderFileIdx: uniqueIndex('idx_playback_history_user_provider_file').on(t.user_id, t.provider_type, t.file_id),
  userIdIdx: index('idx_playback_history_user_id').on(t.user_id),
  providerTypeIdx: index('idx_playback_history_provider_type').on(t.provider_type),
  watchedAtIdx: index('idx_playback_history_watched_at').on(t.watched_at),
}));

export type PlaybackHistory = typeof playbackHistory.$inferSelect;
export type NewPlaybackHistory = typeof playbackHistory.$inferInsert;


// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  resource_type: varchar('resource_type', { length: 100 }), // 'user',  etc
  resource_id: varchar('resource_id', { length: 255 }), // ID of the resource
  details: text('details'), // JSON: additional data
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  status: varchar('status', { length: 50 }).default('success'), // 'success', 'failure'
  error_message: text('error_message'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userIdIdx: index('idx_audit_logs_user_id').on(t.user_id),
  actionIdx: index('idx_audit_logs_action').on(t.action),
  resourceTypeIdx: index('idx_audit_logs_resource_type').on(t.resource_type),
  createdAtIdx: index('idx_audit_logs_created_at').on(t.created_at),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
