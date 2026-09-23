-- マイグレーション記録テーブルを作成
CREATE TABLE IF NOT EXISTS "__drizzle_migrations__" (
  id SERIAL PRIMARY KEY,
  hash TEXT NOT NULL UNIQUE,
  created_at BIGINT NOT NULL
);

-- 既に適用されたマイグレーションを記録
INSERT INTO "__drizzle_migrations__" (hash, created_at) 
VALUES 
  ('0001_vengeful_night_thrasher', 1787984236435),
  ('0001_nappy_lockjaw', 1788289280609),
  ('0002_salty_darwin', 1788289373201),
  ('0003_fantastic_nuke', 1788289387849),
  ('0004_windy_taskmaster', 1789209136712),
  ('0005_auth_refactor', 1789209200000),
  ('0006_premium_turbo', 1790167168852)
ON CONFLICT (hash) DO NOTHING;
