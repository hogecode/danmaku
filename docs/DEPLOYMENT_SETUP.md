# デプロイメントセットアップガイド - AWS Secrets Manager 統合

AWS Secrets Manager で秘密情報を管理し、ECS Fargate にスムーズに注入するセットアップ手順です。

## 前提条件

- AWS CLI がインストール済みで、認証情報が設定されていること
- Terraform がインストール済みであること
- 適切な IAM 権限を持つ AWS アカウント

## ステップ 1: AWS Secrets Manager に秘密を作成

### 1.1 RDS 認証情報の作成

```bash
aws secretsmanager create-secret \
  --name "danmaku/dev/rds/credentials" \
  --description "RDS Master Credentials" \
  --secret-string '{
    "username": "admin",
    "password": "your-strong-rds-password",
    "engine": "mysql",
    "host": "db.example.com",
    "port": 3306,
    "dbname": "danmaku"
  }' \
  --region ap-northeast-1
```

### 1.2 Redis 認証情報の作成

```bash
aws secretsmanager create-secret \
  --name "danmaku/dev/redis/credentials" \
  --description "Redis Connection Credentials" \
  --secret-string '{
    "host": "redis.example.com",
    "port": 6379,
    "password": "your-strong-redis-password",
    "db": 0
  }' \
  --region ap-northeast-1
```

### 1.3 アプリケーション秘密の作成

```bash
aws secretsmanager create-secret \
  --name "danmaku/dev/app/secrets" \
  --description "Application Secrets (JWT, Session, Encryption)" \
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