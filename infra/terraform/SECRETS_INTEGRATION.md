# AWS Secrets Manager Integration with Terraform

## 概要

tfvars ファイルでは Terraform の `${}` 式が使えないため、秘密を以下のように分けて管理します：

```
┌─────────────────────────────────────────────────────────┐
│ prod.tfvars                                             │
│ - aws_account_id = "123456789012"                       │
│ - nestjs_secrets (secretName リスト)                    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Terraform Variables                                     │
│ - aws_account_id (検証: 12 digits)                      │
│ - nestjs_secrets (list of objects)                      │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ ECS Module (main.tf)                                    │
│ - for loop で ARN を構築                                 │
│   arn:aws:secretsmanager:REGION:ACCOUNT:secret:NAME::  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ ECS Task Definition                                     │
│ - secrets リストに valueFrom を設定                      │
└─────────────────────────────────────────────────────────┘
```

---

## prod.tfvars での設定

```hcl
# AWS Account ID (required for Secrets Manager ARN construction)
aws_account_id = "123456789012"  # Change to your account ID

nestjs_secrets = [
  {
    name       = "APP_SECRETS"
    secretName = "danmaku/app-secrets"
  },
  {
    name       = "OAUTH_SECRETS"
    secretName = "danmaku/oauth-secrets"
  },
  {
    name       = "DB_CREDENTIALS"
    secretName = "danmaku/db-credentials"
  },
  {
    name       = "REDIS_CREDENTIALS"
    secretName = "danmaku/redis-credentials"
  }
]
```

---

## AWS Account ID の取得

```bash
# AWS CLI で取得
aws sts get-caller-identity --query Account --output text

# 出力例
123456789012
```

---

## ECS Module の処理ロジック

modules/compute/ecs/variables.tf:

```hcl
variable "nestjs_secrets" {
  description = "NestJS secrets to inject from AWS Secrets Manager"
  type = list(object({
    name       = string  # Environment variable name
    secretName = string  # Secrets Manager secret name
  }))
  default = []
}

variable "aws_account_id" {
  description = "AWS Account ID for constructing Secrets Manager ARNs"
  type        = string
  default     = ""
}
```

modules/compute/ecs/main.tf (task definition secrets):

```hcl
secrets = jsonencode(concat(
  # ... existing secrets ...
  [
    for secret in var.nestjs_secrets : {
      name      = secret.name
      valueFrom = var.aws_account_id != "" ? 
        "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account_id}:secret:${secret.secretName}::" 
        : ""
    }
    if secret.secretName != ""
  ]
))
```

---

## Terraform の呼び出し

root main.tf で ECS module に変数を渡す：

```hcl
module "ecs" {
  source = "./modules/compute/ecs"
  
  # ... other variables ...
  
  nestjs_secrets = var.nestjs_secrets
  aws_account_id = var.aws_account_id
  aws_region     = var.aws_region
}
```

---

## デプロイ手順

### 1. AWS Secrets Manager に秘密を作成

```bash
aws secretsmanager create-secret \
  --name danmaku/app-secrets \
  --secret-string '{"jwt_secret":"...","session_secret":"...","encryption_key":"...","encryption_algorithm":"aes-256-gcm"}' \
  --region ap-northeast-1

aws secretsmanager create-secret \
  --name danmaku/oauth-secrets \
  --secret-string '{"google_client_id":"...","google_client_secret":"...","onedrive_client_id":"","onedrive_client_secret":""}' \
  --region ap-northeast-1

aws secretsmanager create-secret \
  --name danmaku/db-credentials \
  --secret-string '{"host":"...","port":5432,"username":"danmaku","password":"...","dbname":"ecsdb"}' \
  --region ap-northeast-1

aws secretsmanager create-secret \
  --name danmaku/redis-credentials \
  --secret-string '{"host":"...","port":6379,"password":"...","db":0}' \
  --region ap-northeast-1
```

### 2. AWS Account ID を prod.tfvars に設定

```bash
# Account ID を取得
aws sts get-caller-identity --query Account --output text

# prod.tfvars に設定
aws_account_id = "123456789012"
```

### 3. Terraform デプロイ

```bash
cd infra/terraform
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

---

## トラブルシューティング

### エラー: "Variables may not be used here"

**原因**: tfvars ファイルで `${}` 式を使った

**解決**: `secretName` フィールドを使い、main.tf で ARN を構築するように変更

### エラー: "ResourceNotFoundException"

**原因**: Secrets Manager に秘密が存在しない

**確認**:
```bash
aws secretsmanager list-secrets --region ap-northeast-1
```

### エラー: "AccessDeniedException"

**原因**: ECS Task Execution Role に secretsmanager:GetSecretValue 権限がない

**解決**:
```hcl
# IAM Policy を追加
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue"
  ],
  "Resource": "arn:aws:secretsmanager:ap-northeast-1:*:secret:danmaku/*"
}
```

---

## セキュリティベストプラクティス

✅ 推奨：
- Account ID は prod.tfvars に記載可（機密性低い）
- 秘密の内容は Secrets Manager に保存（機密性高い）
- IAM Role で細粒度のアクセス制御

❌ 避ける：
- tfvars に秘密値をハードコーディング
- Git に Account ID をコミット（ない方がベター、あってもい）
