# デプロイメントセットアップガイド - AWS Secrets Manager 統合

AWS Secrets Manager で秘密情報を管理し、ECS Fargate にスムーズに注入するセットアップ手順です。

**詳細手順は [SECRETS_SETUP.md](./SECRETS_SETUP.md) を参照してください。**

## 前提条件

- AWS CLI がインストール済みで、認証情報が設定されていること
- Terraform がインストール済みであること
- 適切な IAM 権限を持つ AWS アカウント

## クイックスタート

### 1. 秘密を作成

以下のコマンドで AWS Secrets Manager に秘密を作成してください（詳細は SECRETS_SETUP.md 参照）：

**注意**: RDS 認証情報は AWS が自動管理しているため、作成は不要です。

```bash
# Redis 認証情報
aws secretsmanager create-secret \
  --name "ecs-sample/dev/redis/credentials" \
  --secret-string '{
    "host": "your-redis-endpoint.cache.amazonaws.com",
    "port": 6379,
    "password": "YourRedisPasswordHere123!",
    "db": 0
  }' \
  --region ap-northeast-1

# アプリケーション秘密
aws secretsmanager create-secret \
  --name "ecs-sample/dev/app/secrets" \
  --secret-string '{
    "jwt_secret": "your-jwt-secret-key-minimum-32-characters-long!",
    "session_secret": "your-session-secret-key-minimum-32-char!",
    "encryption_key": "your-encryption-key-32-characters-long!!",
    "encryption_algorithm": "aes-256-gcm"
  }' \
  --region ap-northeast-1

# OAuth 秘密
aws secretsmanager create-secret \
  --name "ecs-sample/dev/oauth/secrets" \
  --secret-string '{
    "google_client_id": "your-google-client-id.apps.googleusercontent.com",
    "google_client_secret": "your-google-client-secret",
    "onedrive_client_id": "your-onedrive-app-id",
    "onedrive_client_secret": "your-onedrive-app-secret"
  }' \
  --region ap-northeast-1
```

### 2. Terraform を実行

すべての秘密が作成されたことを確認した後、Terraform を実行します：

```bash
cd infra/terraform

# 初期化
terraform init

# 計画を確認
terraform plan -var-file="terraform.dev.tfvars"

# インフラストラクチャを適用
terraform apply -var-file="terraform.dev.tfvars"
```

### 3. 秘密の確認

デプロイ後、秘密が正しく ECS に注入されたか確認します：

```bash
# ECS ログを確認
aws logs tail /ecs/ecs-sample-nestjs-dev --follow --region ap-northeast-1
```

詳細情報は [SECRETS_SETUP.md](./SECRETS_SETUP.md) を参照してください
  --secret-string '{
    "jwt_secret": "your-jwt-secret-key",
    "session_secret": "your-session-secret-key",
    "encryption_key": "your-encryption-key",
    "encryption_algorithm": "aes-256-gcm"
  }' \
  --region ap-northeast-1
```

### 1.4 OAuth 認証情報の作成

```bash
aws secretsmanager create-secret \
  --name "danmaku/dev/oauth/secrets" \
  --description "OAuth Provider Credentials" \
  --secret-string '{
    "google_client_id": "xxx.apps.googleusercontent.com",
    "google_client_secret": "your-google-client-secret",
    "onedrive_client_id": "your-onedrive-client-id",
    "onedrive_client_secret": "your-onedrive-client-secret"
  }' \
  --region ap-northeast-1
```

### 1.5 秘密が正しく作成されたか確認

```bash
# リストアップ
aws secretsmanager list-secrets \
  --filters Key=name,Values=danmaku \
  --region ap-northeast-1 \
  --output table

# 内容確認
aws secretsmanager get-secret-value \
  --secret-id danmaku/dev/rds/credentials \
  --region ap-northeast-1 \
  --query 'SecretString' | jq .
```

## ステップ 2: Terraform 設定ファイルの準備

### 2.1 開発環境用ファイルの作成

```bash
cd infra/terraform
cp terraform.dev.example.tfvars terraform.dev.tfvars
```

### 2.2 ファイル保護確認

`.gitignore` に `terraform.*.tfvars` が含まれていることを確認：

```bash
grep "terraform.*\.tfvars" .gitignore
```

### 2.3 terraform.dev.tfvars の内容

秘密値は AWS Secrets Manager で管理されているため、**このファイルには秘密値を入れません**：

```hcl
# Redis Database Number のみ設定
redis_db = 0
```