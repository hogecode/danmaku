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


// OAuth Accounts
export const oauthAccounts = pgTable('oauth_accounts', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  user_id: bigserial('user_id', { mode: 'bigint' }).notNull(),
  provider_name: varchar('provider_name', { length: 50 }).notNull(),
  provider_user_id: varchar('provider_user_id', { length: 255 }).notNull(),
  provider_email: varchar('provider_email', { length: 255 }),
  access_token: text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  access_token_expires_at: timestamp('access_token_expires_at', { withTimezone: true }),
  refresh_token_expires_at: timestamp('refresh_token_expires_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdFk: foreignKey({ columns: [t.user_id], foreignColumns: [users.id] }).onDelete('cascade'),
  userProviderIdx: uniqueIndex('idx_oauth_accounts_user_provider').on(t.user_id, t.provider_name, t.provider_user_id),
  userIdIdx: index('idx_oauth_accounts_user_id').on(t.user_id),
}));

export type OAuthAccount = typeof oauthAccounts.$inferSelect;
export type NewOAuthAccount = typeof oauthAccounts.$inferInsert;

