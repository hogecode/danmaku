import {
  pgTable,
  bigserial,
  bigint,
  varchar,
  text,
  timestamp,
  boolean,
  uniqueIndex,
  index,
  foreignKey,
} from 'drizzle-orm/pg-core';

// Users
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  picture_url: varchar('picture_url', { length: 512 }),
  is_active: boolean('is_active').default(true),
  last_login: timestamp('last_login', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({ emailIdx: index('idx_users_email').on(t.email) }));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;


// Local Auth
export const localAuth = pgTable('local_auth', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  password_salt: varchar('password_salt', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
}));

export type LocalAuth = typeof localAuth.$inferSelect;
export type NewLocalAuth = typeof localAuth.$inferInsert;


// Auth Identities (ログイン用)
export const authIdentities = pgTable('auth_identities', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  
  // ログイン方法
  provider_name: varchar('provider_name', { length: 50 }).notNull(),
  // 'google' / 'github' / 'password' など
  
  // プロバイダー側のユーザー識別子
  provider_user_id: varchar('provider_user_id', { length: 255 }).notNull(),
  provider_email: varchar('provider_email', { length: 255 }),
  
  // このIdentityはメインログインか
  is_primary: boolean('is_primary').default(true),
  
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  // 同じプロバイダーの複数 Identity は不許可（1ユーザー = 1ログイン方法）
  uniqueIdx: uniqueIndex('idx_auth_identities_unique').on(t.user_id, t.provider_name),
  userIdIdx: index('idx_auth_identities_user_id').on(t.user_id),
  providerIdx: index('idx_auth_identities_provider').on(t.provider_name),
}));

export type AuthIdentity = typeof authIdentities.$inferSelect;
export type NewAuthIdentity = typeof authIdentities.$inferInsert;


// Drive Connections (Drive用、複数可)
export const driveConnections = pgTable('drive_connections', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  
  // Drive プロバイダー
  provider_name: varchar('provider_name', { length: 50 }).notNull(),
  // 'google' / 'onedrive' / 'dropbox' など
  
  // プロバイダー側の Drive アカウント識別子
  // Google: メールアドレス (abc@gmail.com, xyz@gmail.com など)
  provider_account_id: varchar('provider_account_id', { length: 255 }).notNull(),
  provider_account_email: varchar('provider_account_email', { length: 255 }),
  
  // Drive 用トークン（アプリ側で AES-256 暗号化）
  access_token_encrypted: text('access_token_encrypted').notNull(),
  refresh_token_encrypted: text('refresh_token_encrypted'),
  
  // スコープ（Drive 用）JSON形式
  scopes: text('scopes'), // JSON: ["drive.readonly"] or ["drive.file"]
  access_token_expires_at: timestamp('access_token_expires_at', { withTimezone: true }),
  refresh_token_expires_at: timestamp('refresh_token_expires_at', { withTimezone: true }),
  
  // この接続がアクティブか
  is_active: boolean('is_active').default(true),
  
  // 最後にアクセスした時刻
  last_accessed_at: timestamp('last_accessed_at', { withTimezone: true }),
  
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  // 1ユーザーが同じ Drive アカウントを複数回接続するのは防止
  uniqueIdx: uniqueIndex('idx_drive_connections_unique').on(t.user_id, t.provider_name, t.provider_account_id),
  userIdIdx: index('idx_drive_connections_user_id').on(t.user_id),
  providerIdx: index('idx_drive_connections_provider').on(t.provider_name),
  isActiveIdx: index('idx_drive_connections_is_active').on(t.is_active),
}));

export type DriveConnection = typeof driveConnections.$inferSelect;
export type NewDriveConnection = typeof driveConnections.$inferInsert;

