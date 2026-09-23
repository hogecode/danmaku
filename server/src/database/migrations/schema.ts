import { pgTable, foreignKey, unique, bigserial, varchar, integer, jsonb, timestamp, index, boolean, uniqueIndex, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userSettings = pgTable("user_settings", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	theme: varchar({ length: 20 }).default('light'),
	language: varchar({ length: 10 }).default('jp'),
	danmakuMaxCount: integer("danmaku_max_count").default(1000),
	ngWordsReg: jsonb("ng_words_reg").default([]).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_settings_user_id_unique").on(table.userId),
]);

export const users = pgTable("users", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	pictureUrl: varchar("picture_url", { length: 512 }),
	isActive: boolean("is_active").default(true),
	lastLogin: timestamp("last_login", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

export const localAuth = pgTable("local_auth", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	passwordSalt: varchar("password_salt", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "local_auth_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("local_auth_user_id_unique").on(table.userId),
]);

export const favorites = pgTable("favorites", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	providerType: varchar("provider_type", { length: 50 }).notNull(),
	fileId: varchar("file_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_favorites_provider_type").using("btree", table.providerType.asc().nullsLast().op("text_ops")),
	index("idx_favorites_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("idx_favorites_user_provider_file").using("btree", table.userId.asc().nullsLast().op("int8_ops"), table.providerType.asc().nullsLast().op("text_ops"), table.fileId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "favorites_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const playlists = pgTable("playlists", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	thumbnailUrl: varchar("thumbnail_url", { length: 512 }),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_playlists_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "playlists_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const playlistItems = pgTable("playlist_items", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	playlistId: bigserial("playlist_id", { mode: "bigint" }).notNull(),
	providerType: varchar("provider_type", { length: 50 }).notNull(),
	fileId: varchar("file_id", { length: 255 }).notNull(),
	position: integer().notNull(),
	addedAt: timestamp("added_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_playlist_items_file_id").using("btree", table.fileId.asc().nullsLast().op("text_ops")),
	index("idx_playlist_items_playlist_id").using("btree", table.playlistId.asc().nullsLast().op("int8_ops")),
	index("idx_playlist_items_provider_type").using("btree", table.providerType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.playlistId],
			foreignColumns: [playlists.id],
			name: "playlist_items_playlist_id_playlists_id_fk"
		}).onDelete("cascade"),
]);

export const screenshots = pgTable("screenshots", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	providerType: varchar("provider_type", { length: 50 }).notNull(),
	fileId: varchar("file_id", { length: 255 }).notNull(),
	timestampSeconds: integer("timestamp_seconds").notNull(),
	imageUrl: varchar("image_url", { length: 512 }).notNull(),
	fileSize: integer("file_size"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_screenshots_file_id").using("btree", table.fileId.asc().nullsLast().op("text_ops")),
	index("idx_screenshots_provider_type").using("btree", table.providerType.asc().nullsLast().op("text_ops")),
	index("idx_screenshots_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "screenshots_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const auditLogs = pgTable("audit_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	resourceType: varchar("resource_type", { length: 100 }),
	resourceId: varchar("resource_id", { length: 255 }),
	details: text(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	status: varchar({ length: 50 }).default('success'),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_audit_logs_action").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_audit_logs_resource_type").using("btree", table.resourceType.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const playbackHistory = pgTable("playback_history", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	providerType: varchar("provider_type", { length: 50 }).notNull(),
	fileId: varchar("file_id", { length: 255 }).notNull(),
	positionSeconds: integer("position_seconds"),
	durationSeconds: integer("duration_seconds"),
	isCompleted: boolean("is_completed").default(false),
	watchedAt: timestamp("watched_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_playback_history_provider_type").using("btree", table.providerType.asc().nullsLast().op("text_ops")),
	index("idx_playback_history_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	uniqueIndex("idx_playback_history_user_provider_file").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.providerType.asc().nullsLast().op("int8_ops"), table.fileId.asc().nullsLast().op("int8_ops")),
	index("idx_playback_history_watched_at").using("btree", table.watchedAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "playback_history_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const authIdentities = pgTable("auth_identities", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	providerName: varchar("provider_name", { length: 50 }).notNull(),
	providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
	providerEmail: varchar("provider_email", { length: 255 }),
	isPrimary: boolean("is_primary").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_auth_identities_provider").using("btree", table.providerName.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_auth_identities_unique").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.providerName.asc().nullsLast().op("text_ops")),
	index("idx_auth_identities_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_identities_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_identities_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const driveConnections = pgTable("drive_connections", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: bigserial("user_id", { mode: "bigint" }).notNull(),
	providerName: varchar("provider_name", { length: 50 }).notNull(),
	providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
	providerAccountEmail: varchar("provider_account_email", { length: 255 }),
	accessTokenEncrypted: text("access_token_encrypted").notNull(),
	refreshTokenEncrypted: text("refresh_token_encrypted"),
	scopes: text(),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true),
	lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_drive_connections_is_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("idx_drive_connections_provider").using("btree", table.providerName.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_drive_connections_unique").using("btree", table.userId.asc().nullsLast().op("int8_ops"), table.providerName.asc().nullsLast().op("int8_ops"), table.providerAccountId.asc().nullsLast().op("text_ops")),
	index("idx_drive_connections_user_id").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "drive_connections_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "drive_connections_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
