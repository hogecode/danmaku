CREATE TABLE "drive_connections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"provider_account_email" varchar(255),
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"scopes" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "oauth_accounts" RENAME TO "auth_identities";--> statement-breakpoint
ALTER TABLE "auth_identities" DROP CONSTRAINT "oauth_accounts_user_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "idx_oauth_accounts_user_provider";--> statement-breakpoint
DROP INDEX "idx_oauth_accounts_user_id";--> statement-breakpoint
UPDATE "user_settings" SET "ng_words_reg" = '[]' WHERE "ng_words_reg" IS NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "ng_words_reg" SET DATA TYPE jsonb USING "ng_words_reg"::jsonb;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "ng_words_reg" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "ng_words_reg" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "is_primary" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_drive_connections_unique" ON "drive_connections" USING btree ("user_id","provider_name","provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_drive_connections_user_id" ON "drive_connections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_drive_connections_provider" ON "drive_connections" USING btree ("provider_name");--> statement-breakpoint
CREATE INDEX "idx_drive_connections_is_active" ON "drive_connections" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_auth_identities_unique" ON "auth_identities" USING btree ("user_id","provider_name");--> statement-breakpoint
CREATE INDEX "idx_auth_identities_user_id" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_identities_provider" ON "auth_identities" USING btree ("provider_name");--> statement-breakpoint
ALTER TABLE "auth_identities" DROP COLUMN "access_token";--> statement-breakpoint
ALTER TABLE "auth_identities" DROP COLUMN "refresh_token";--> statement-breakpoint
ALTER TABLE "auth_identities" DROP COLUMN "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "auth_identities" DROP COLUMN "refresh_token_expires_at";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "auto_play_next";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "playback_speed";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "danmaku_enabled";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "danmaku_opacity";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "danmaku_display_duration";