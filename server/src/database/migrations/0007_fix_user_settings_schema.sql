-- user_settings スキーマ修正: ng_words_regをJSONB型に、古いカラムを削除
UPDATE "user_settings" SET "ng_words_reg" = '[]' WHERE "ng_words_reg" IS NULL OR "ng_words_reg" = '';
ALTER TABLE "user_settings" ALTER COLUMN "ng_words_reg" SET DATA TYPE jsonb USING "ng_words_reg"::jsonb;
ALTER TABLE "user_settings" ALTER COLUMN "ng_words_reg" SET DEFAULT '[]'::jsonb;
ALTER TABLE "user_settings" ALTER COLUMN "ng_words_reg" SET NOT NULL;

-- 削除すべきカラムを削除
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "auto_play_next";
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "playback_speed";
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "danmaku_enabled";
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "danmaku_opacity";
ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "danmaku_display_duration";
