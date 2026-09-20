# AWS Secrets Manager セットアップガイド

このガイドは、AWS Secrets Manager で秘密を作成し、Terraform で参照可能にする手順です。

## 前提条件

- AWS CLI がインストールされていること
- AWS 認証情報が設定されていること (`aws configure`)
- 適切な IAM 権限を持っていること（`secretsmanager:CreateSecret`）

## 秘密の作成

Terraform 適用の**前に**、以下の秘密を AWS Secrets Manager で作成する必要があります。

**注意**: RDS 認証情報は AWS が自動管理します（RDS の `manage_master_user_password = true` 設定により、秘密は自動作成・管理される）。RDS 秘密は手動作成しないでください。

### 1. Redis 認証情報秘密

```bash
aws secretsmanager create-secret \
  --name "ecs-sample/dev/redis/credentials" \
  --secret-string '{
    "host": "your-redis-endpoint.cache.amazonaws.com",
    "port": 6379,
    "password": "YourRedisPasswordHere123!",
    "db": 0
  }' \
  --region ap-northeast-1
```

**重要な項目:**
- `host`: ElastiCache (Redis) エンドポイント
- `port`: Redis ポート（通常 6379）
- `password`: Redis パスワード
- `db`: 使用するデータベース番号

### 3. アプリケーション秘密

```bash
aws secretsmanager create-secret \
  --name "ecs-sample/dev/app/secrets" \
  --secret-string '{
    "jwt_secret": "your-jwt-secret-key-minimum-32-characters-long!",
    "session_secret": "your-session-secret-key-minimum-32-char!",
    "encryption_key": "your-encryption-key-32-characters-long!!",
    "encryption_algorithm": "aes-256-gcm"
  }' \
  --region ap-northeast-1
```

**重要な項目:**
- `jwt_secret`: JWT トークン署名用秘密（最小 32 文字）
- `session_secret`: セッション暗号化用秘密（最小 32 文字）
- `encryption_key`: データ暗号化用キー（最小 32 文字）
- `encryption_algorithm`: 暗号化アルゴリズム

### 4. OAuth 秘密

```bash
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

**重要な項目:**
- `google_client_id`: Google OAuth クライアント ID
- `google_client_secret`: Google OAuth クライアント秘密
- `onedrive_client_id`: Azure AD アプリケーション ID
- `onedrive_client_secret`: Azure AD クライアント秘密

## 秘密の検証

作成した秘密が正しく登録されたか確認します：

```bash
# RDS 秘密を確認（AWS が自動作成）
aws secretsmanager list-secrets \
  --filters Key=name,Values=rds \
  --region ap-northeast-1

# Redis 秘密を取得
aws secretsmanager get-secret-value \
  --secret-id "ecs-sample/dev/redis/credentials" \
  --region ap-northeast-1

# アプリケーション秘密を取得
aws secretsmanager get-secret-value \
  --secret-id "ecs-sample/dev/app/secrets" \
  --region ap-northeast-1

# OAuth 秘密を取得
aws secretsmanager get-secret-value \
  --secret-id "ecs-sample/dev/oauth/secrets" \
  --region ap-northeast-1
```

## Terraform 適用

すべての秘密が作成された後、Terraform を適用します：

```bash
cd infra/terraform

# Terraform 初期化
terraform init

# 計画を確認
terraform plan -var-file="terraform.dev.tfvars"

# インフラストラクチャを適用
terraform apply -var-file="terraform.dev.tfvars"
```

## 秘密の更新

秘密を更新する場合は、以下のコマンドを使用します：

```bash
aws secretsmanager update-secret \
  --secret-id "ecs-sample/dev/app/secrets" \
  --secret-string '{...updated values...}' \
  --region ap-northeast-1
```

## 秘密のローテーション

重要な秘密（パスワード、API キーなど）は定期的にローテーションすることをお勧めします：

```bash
# 秘密をローテーション
aws secretsmanager rotate-secret \
  --secret-id "ecs-sample/dev/rds/credentials" \
  --rotation-rules "AutomaticallyAfterDays=30" \
  --region ap-northeast-1
```

## トラブルシューティング

### Error: couldn't find resource

秘密が作成されていません。上記の秘密作成手順を実行してください。

```bash
# 秘密の一覧を確認
aws secretsmanager list-secrets \
  --filters Key=name,Values=ecs-sample/dev \
  --region ap-northeast-1
```

### Error: User is not authorized to perform

IAM 権限が不足しています。以下の権限があることを確認してください：
- `secretsmanager:CreateSecret`
- `secretsmanager:UpdateSecret`
- `secretsmanager:GetSecretValue`

## セキュリティベストプラクティス

1. **強力なパスワード**: 最小 32 文字の複雑なパスワードを使用
2. **ローテーション**: 重要な秘密は 30～90 日ごとにローテーション
3. **監査**: CloudTrail で秘密のアクセスを監視
4. **最小権限**: IAM ロールに必要最小限の権限を付与
5. **KMS 暗号化**: AWS KMS で秘密を暗号化

---

**次のステップ:** Terraform 適用後、ECS ログで秘密が正しく注入されたか確認します。
