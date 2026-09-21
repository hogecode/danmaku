# AWS Secrets Manager Module

このモジュールはAWS Secrets Managerのシークレットを管理します。

## 概要

### 自動作成されるシークレット

- **Redis Credentials** (`{project_name}/{environment}/redis/credentials`)
  - ElastiCacheのエンドポイント情報を自動的に設定
  - シークレットが存在しない場合は自動作成される

### 参照またはオプションで自動作成

- **Application Secrets** (`{project_name}/{environment}/app/secrets`)
  - デフォルト: 既存のシークレットを参照（`create_app_secrets = false`）
  - `create_app_secrets = true`を設定すると自動作成

- **OAuth Secrets** (`{project_name}/{environment}/oauth/secrets`)
  - デフォルト: 既存のシークレットを参照（`create_oauth_secrets = false`）
  - `create_oauth_secrets = true`を設定すると自動作成

## 使用方法

### デフォルト設定（既存シークレットを参照）

```hcl
module "secrets_manager" {
  source = "./modules/secrets/secrets-manager"

  project_name   = "danmaku"
  environment    = "prod"
  common_tags    = local.common_tags

  redis_endpoint = module.cache.redis_endpoint
  redis_port     = module.cache.redis_port
}
```

**前提条件**: 以下のシークレットが事前に存在している必要があります：
```bash
aws secretsmanager create-secret --name "danmaku/prod/app/secrets" --secret-string '{...}'
aws secretsmanager create-secret --name "danmaku/prod/oauth/secrets" --secret-string '{...}'
```

### アプリケーションシークレットを自動作成する場合

```hcl
module "secrets_manager" {
  source = "./modules/secrets/secrets-manager"

  project_name       = "danmaku"
  environment        = "prod"
  common_tags        = local.common_tags

  redis_endpoint     = module.cache.redis_endpoint
  redis_port         = module.cache.redis_port

  # App Secrets を自動作成
  create_app_secrets = true
  app_secrets_data = {
    jwt_secret     = var.jwt_secret
    session_secret = var.session_secret
  }
}
```

### 両方のシークレットを自動作成する場合

```hcl
module "secrets_manager" {
  source = "./modules/secrets/secrets-manager"

  project_name        = "danmaku"
  environment         = "prod"
  common_tags         = local.common_tags

  redis_endpoint      = module.cache.redis_endpoint
  redis_port          = module.cache.redis_port

  create_app_secrets  = true
  app_secrets_data = {
    jwt_secret     = var.jwt_secret
    session_secret = var.session_secret
  }

  create_oauth_secrets = true
  oauth_secrets_data = {
    google_client_id     = var.google_client_id
    google_client_secret = var.google_client_secret
  }
}
```

## トラブルシューティング

### "couldn't find resource" エラーが発生した場合

エラー例:
```
Error: reading Secrets Manager Secret (danmaku/prod/app/secrets): couldn't find resource
```

**原因**: 参照しようとしているシークレットがAWS上に存在しない

**解決策**:

1. **AWS CLIで手動作成**
   ```bash
   aws secretsmanager create-secret \
     --name "danmaku/prod/app/secrets" \
     --secret-string '{"jwt_secret":"...","session_secret":"..."}'
   ```

2. **またはTerraformで自動作成に切り替え**
   ```hcl
   create_app_secrets = true
   app_secrets_data = {
     jwt_secret     = var.jwt_secret
     session_secret = var.session_secret
   }
   ```

### "AlreadyExists" エラーが発生した場合

既存のシークレットが存在する場合、Terraformにインポートします：

```bash
terraform import 'module.secrets_manager.aws_secretsmanager_secret.app_secrets[0]' 'danmaku/prod/app/secrets'
```

## Variables

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|----------|
| `project_name` | プロジェクト名 | string | - | Yes |
| `environment` | 環境名 (dev, staging, prod) | string | - | Yes |
| `common_tags` | 共通タグ | map(string) | {} | No |
| `redis_endpoint` | Redisエンドポイントアドレス | string | "" | No |
| `redis_port` | Redisポート | number | 6379 | No |
| `create_app_secrets` | App secretsを作成するか | bool | false | No |
| `create_oauth_secrets` | OAuth secretsを作成するか | bool | false | No |
| `app_secrets_data` | App secretsのデータ | map(string) | {} | No |
| `oauth_secrets_data` | OAuth secretsのデータ | map(string) | {} | No |

## Outputs

| Name | Description |
|------|-------------|
| `redis_credentials_secret_arn` | Redis credentialsシークレットのARN |
| `redis_credentials_secret_id` | Redis credentialsシークレットのID |
| `app_secrets_secret_arn` | App secretsシークレットのARN |
| `app_secrets_secret_id` | App secretsシークレットのID |
| `oauth_secrets_secret_arn` | OAuth secretsシークレットのARN |
| `oauth_secrets_secret_id` | OAuth secretsシークレットのID |
