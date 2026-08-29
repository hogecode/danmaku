CREATE TABLE "local_auth" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"password_salt" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "local_auth_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"provider_email" varchar(255),
	"access_token" text NOT NULL,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"picture_url" varchar(512),
	"is_active" boolean DEFAULT true,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"device_type" varchar(50) NOT NULL,
	"device_name" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"last_activity" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"theme" varchar(20) DEFAULT 'light',
	"language" varchar(10) DEFAULT 'jp',
	"auto_play_next" boolean DEFAULT false,
	"playback_speed" varchar(10) DEFAULT '1.0',
	"danmaku_enabled" boolean DEFAULT true,
	"danmaku_opacity" varchar(5) DEFAULT '1.0',
	"danmaku_max_count" integer DEFAULT 1000,
	"danmaku_display_duration" integer DEFAULT 5000,
	"ng_words_reg" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider_type" varchar(50) NOT NULL,
	"file_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"playlist_id" bigserial NOT NULL,
	"provider_type" varchar(50) NOT NULL,
	"file_id" varchar(255) NOT NULL,
	"position" integer NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"thumbnail_url" varchar(512),
	"is_public" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "screenshots" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider_type" varchar(50) NOT NULL,
	"file_id" varchar(255) NOT NULL,
	"timestamp_seconds" integer NOT NULL,
	"image_url" varchar(512) NOT NULL,
	"file_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100),
	"resource_id" varchar(255),
	"details" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"status" varchar(50) DEFAULT 'success',
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playback_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider_type" varchar(50) NOT NULL,
	"file_id" varchar(255) NOT NULL,
	"position_seconds" integer,
	"duration_seconds" integer,
	"is_completed" boolean DEFAULT false,
	"watched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "local_auth" ADD CONSTRAINT "local_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_history" ADD CONSTRAINT "playback_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_oauth_accounts_user_provider" ON "oauth_accounts" USING btree ("user_id","provider_name","provider_user_id");--> statement-breakpoint
CREATE INDEX "idx_oauth_accounts_user_id" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_last_activity" ON "user_sessions" USING btree ("last_activity");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_favorites_user_provider_file" ON "favorites" USING btree ("user_id","provider_type","file_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_user_id" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_provider_type" ON "favorites" USING btree ("provider_type");--> statement-breakpoint
CREATE INDEX "idx_playlist_items_playlist_id" ON "playlist_items" USING btree ("playlist_id");--> statement-breakpoint
CREATE INDEX "idx_playlist_items_file_id" ON "playlist_items" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "idx_playlist_items_provider_type" ON "playlist_items" USING btree ("provider_type");--> statement-breakpoint
CREATE INDEX "idx_playlists_user_id" ON "playlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_screenshots_user_id" ON "screenshots" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_screenshots_file_id" ON "screenshots" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "idx_screenshots_provider_type" ON "screenshots" USING btree ("provider_type");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_resource_type" ON "audit_logs" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_playback_history_user_provider_file" ON "playback_history" USING btree ("user_id","provider_type","file_id");--> statement-breakpoint
CREATE INDEX "idx_playback_history_user_id" ON "playback_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_playback_history_provider_type" ON "playback_history" USING btree ("provider_type");--> statement-breakpoint
CREATE INDEX "idx_playback_history_watched_at" ON "playback_history" USING btree ("watched_at");