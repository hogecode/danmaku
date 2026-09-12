-- Drop old oauth_accounts table
DROP TABLE "oauth_accounts" CASCADE;

-- Create auth_identities table (ログイン用)
CREATE TABLE "auth_identities" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider_name" varchar(50) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"provider_email" varchar(255),
	"is_primary" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create drive_connections table (Drive用、複数可)
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

-- Add foreign keys
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "drive_connections" ADD CONSTRAINT "drive_connections_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;

-- Create indexes for auth_identities
CREATE UNIQUE INDEX "idx_auth_identities_unique" ON "auth_identities" ("user_id","provider_name");
CREATE INDEX "idx_auth_identities_user_id" ON "auth_identities" ("user_id");
CREATE INDEX "idx_auth_identities_provider" ON "auth_identities" ("provider_name");

-- Create indexes for drive_connections
CREATE UNIQUE INDEX "idx_drive_connections_unique" ON "drive_connections" ("user_id","provider_name","provider_account_id");
CREATE INDEX "idx_drive_connections_user_id" ON "drive_connections" ("user_id");
CREATE INDEX "idx_drive_connections_provider" ON "drive_connections" ("provider_name");
CREATE INDEX "idx_drive_connections_is_active" ON "drive_connections" ("is_active");
