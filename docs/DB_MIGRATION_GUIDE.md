# Database Migration Guide

## 概要

このプロジェクトでは、Drizzle ORM を使用して PostgreSQL データベースのマイグレーションを管理しています。GitHub Actions を通じて自動実行されます。

## マイグレーション実行方法

### 1️⃣ 自動実行（CI/CD パイプライン）

デプロイ時に自動的にマイグレーションが実行されます：

```
GitHub Push/PR Merge
   ↓
build.yml (イメージビルド)
   ↓
scan.yml (セキュリティスキャン)
   ↓
deploy.yml (ECS デプロイ)
   ↓
db-migrate.yml (DB マイグレーション) ← Dry-run → 実行
```

### 2️⃣ 手動実行

任意のタイミングでマイグレーションを実行：

```bash
# GitHub CLI を使用
gh workflow run db-migrate-manual.yml \
  -f environment=dev \
  -f migration_type=migrate \
  -f image_tag=dev-abc123

# または GitHub Actions UI から実行
# .github/workflows/db-migrate-manual.yml → "Run workflow"
```

## マイグレーション作成方法

### ステップ 1: スキーマを定義

```typescript
// server/src/database/auth.schema.ts
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique(),
  // ...其他字段
});
```

### ステップ 2: マイグレーションを生成

```bash
cd server

# SQL ファイルを生成
yarn db:generate

# 出力: src/database/migrations/YYYYMMDDHHMMSS_<description>.sql
```

### ステップ 3: マイグレーションファイルを確認

```bash
cat src/database/migrations/20240101120000_initial_schema.sql
```

出力例：
```sql
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE
);
```

### ステップ 4: コミット & プッシュ

```bash
git add server/src/database/migrations/
git commit -m "feat: add users table"
git push origin feature/users
```

PR がマージされると自動的にマイグレーションが実行されます。

---

## マイグレーション実行フロー

### 📋 Dry-Run フェーズ

```bash
# 1. ECS Fargate でマイグレーションコンテナを起動
aws ecs run-task \
  --cluster ecs-sample-cluster-dev \
  --task-definition ecs-sample-nestjs:1 \
  --launch-type FARGATE \
  --network-configuration awsvpcConfiguration={...}

# 2. Dry-run で実行
yarn db:migrate --dry

# 3. ログを確認（変更内容のプレビュー）
# 4. 失敗 → 作業停止
# 5. 成功 → 実行フェーズへ進む
```

### ✅ 実行フェーズ

```bash
# 1. 同じコンテナでマイグレーション実行
yarn db:migrate

# 2. 結果確認
# 3. 失敗 → ロールバック（下記参照）
# 4. 成功 → 完了
```

---

## ロールバック手順

### 仕組み

Drizzle では、マイグレーションファイル内に `UP` と `DOWN` の 2つの SQL が含まれています：

```sql
-- UP: スキーマ変更（適用時）
CREATE TABLE users (id SERIAL PRIMARY KEY);

-- DOWN: ロールバック（打消し時）
DROP TABLE users;
```

### 手動ロールバック実行

**方法 1: 逆マイグレーションファイルを作成**

```bash
# 前のマイグレーションに戻す SQL を作成
cat > server/src/database/migrations/20240102_rollback.sql << 'EOF'
-- Rollback previous migration
DROP TABLE IF EXISTS users;
EOF

# コミット & プッシュ
git add server/src/database/migrations/20240102_rollback.sql
git commit -m "fix: rollback users table"
git push

# GitHub Actions で実行
# db-migrate-manual.yml を実行
```

**方法 2: CLI から直接実行**

```bash
# 本番環境の場合
gh workflow run db-migrate-manual.yml \
  -f environment=prod \
  -f migration_type=rollback \
  -f image_tag=prod-latest
```

---

## トラブルシューティング

### Q: Dry-run に失敗した

**原因**: SQL 構文エラーまたは DB 制約違反

**解決策**:
1. CloudWatch ログで詳細を確認
2. マイグレーションファイルを修正
3. 再度プッシュして実行

```bash
# ログ確認
aws logs tail /ecs/ecs-sample-nestjs-dev --follow --region ap-northeast-1
```

### Q: 実行フェーズで失敗した

**原因**: Dry-run を通したが、実際の実行時に別の理由で失敗

**解決策**:
1. 同じロールバックマイグレーションで打消し
2. 新しいマイグレーションを作成

```bash
# ロールバック実行
gh workflow run db-migrate-manual.yml \
  -f environment=dev \
  -f migration_type=rollback

# 原因修正後、再度実行
```

### Q: DB コネクションが接続できない

**原因**: セキュリティグループ設定または RDS 秘密情報が不正

**確認項目**:
1. `NESTJS_SECURITY_GROUP_ID` が正しいか
2. `DB_SUBNET_IDS` が RDS と同一 VPC か
3. RDS 秘密情報が AWS Secrets Manager に存在するか

```bash
# RDS 秘密確認
aws secretsmanager list-secrets --region ap-northeast-1
```

---

## GitHub Secrets 設定

以下を GitHub Secrets に登録してください：

```
AWS_REGION                      = ap-northeast-1
AWS_ACCOUNT_ID                  = 885547925004
AWS_ROLE_ARN                    = arn:aws:iam::...
ECR_NESTJS_REPOSITORY_NAME      = ecs-nestjs
ECS_CLUSTER_NAME                = ecs-sample-cluster-dev
DB_SUBNET_IDS                   = subnet-xxx,subnet-yyy
NESTJS_SECURITY_GROUP_ID        = sg-xxx
```

### Subnet IDs 確認

```bash
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=<VPC_ID>" \
  --region ap-northeast-1 \
  --query 'Subnets[?Tags[?Key==`Type` && Value==`private-db`]].SubnetId' \
  --output text
```

---

## マイグレーション例

### 例 1: テーブル作成

```typescript
// src/database/auth.schema.ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').unique(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

実行:
```bash
yarn db:generate
# ファイル: src/database/migrations/20240101_create_users_table.sql
```

### 例 2: カラム追加

```typescript
// src/database/auth.schema.ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email').unique(),
  username: varchar('username'),  // ← 新規
  createdAt: timestamp('created_at').defaultNow(),
});
```

実行:
```bash
yarn db:generate
# ファイル: src/database/migrations/20240102_add_username_to_users.sql
```

---

## 参考資料

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Migrations](https://orm.drizzle.team/docs/guides/sql-migrations)
- [AWS ECS Task Definition](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html)
