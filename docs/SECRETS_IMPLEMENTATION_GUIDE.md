# AWS Secrets Manager 実装ガイド

このガイドは、AWS Secrets Manager を使用した秘密管理の実装方法とベストプラクティスを説明します。

## 概要

```
AWS Secrets Manager (秘密の source of truth)
    ↓
Terraform (参照のみ - リソース作成なし)
    ↓
ECS Task Definition (環境変数として注入)
    ↓
ECS Fargate Container
    ↓
NestJS Application (secret-parser で解析)
```

## セットアップ手順

### ステップ 1: AWS CLI で秘密を作成

詳細は docs/SECRETS_SETUP.md を参照してください。

```bash
aws secretsmanager create-secret \
  --name "ecs-sample/dev/rds/credentials" \
  --secret-string ''{...}''
```

### ステップ 2: Terraform を実行

```bash
cd infra/terraform
terraform init
terraform apply -var-file="terraform.dev.tfvars"
```

### ステップ 3: ECS が秘密を読み込み

Terraform 適用後、ECS Task Definition が秘密を環境変数として自動注入します。

## セキュリティのベストプラクティス

### 1. 秘密値の保護

- ✅ 秘密値は AWS Secrets Manager に格納
- ✅ 秘密値は .tfvars に含めない
- ✅ 秘密値はコミットしない

### 2. アクセス制御

ECS Task Execution Role に以下の権限を付与：

```json
{
  "Effect": "Allow",
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:*:*:secret:ecs-sample/*"
}
```

### 3. 監査とログ

CloudTrail で秘密のアクセスを監視します。

## トラブルシューティング

### エラー: couldn't find resource

**原因**: 秘密がまだ作成されていない

**対応**:
```bash
aws secretsmanager list-secrets --region ap-northeast-1
aws secretsmanager create-secret --name "ecs-sample/dev/rds/credentials" --secret-string ''{...}''
```

### エラー: User is not authorized to perform

**原因**: IAM 権限が不足しています。

---

詳細は `docs/SECRETS_SETUP.md` を参照してください。
