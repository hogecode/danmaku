# CI/CD Module (GitHub Actions + OIDC)

GitHub Actions と AWS GitHub OIDC を使用した完全な CI/CD パイプラインを Terraform で実装します。

## 概要

このモジュールは以下を実装します：

- **GitHub OIDC Provider**: TLS 証明書から動的に thumbprint を取得して作成
- **IAM Role**: GitHub Actions 用のオンデマンド権限昇格
- **ECR Push 権限**: Docker イメージの ECR へのプッシュ
- **ECS デプロイ権限**: ECS タスク定義の更新とサービスのデプロイ

## アーキテクチャ

```
Terraform Apply
        ↓
  1. TLS Certificate から Thumbprint 取得
        ↓
  2. GitHub OIDC Provider を AWS に作成
        ↓
  3. GitHub Actions 用 IAM Role を作成
        ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GitHub Actions Workflow 実行時
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. OIDC Token Request（GitHub Actions）
        ↓
  2. Token を AWS に送信
        ↓
  3. AWS GitHub OIDC Provider で検証
        ↓
  4. IAM Role を Assume（短期認証情報取得）
        ↓
  5. ECR Push + ECS Deploy 実行
```

## 使用方法

### 基本的な呼び出し（main.tf）

```hcl
module "cicd" {
  source = "./modules/cicd"

  project_name                    = var.project_name
  environment                     = var.environment
  aws_region                      = var.aws_region
  github_oidc_subject_claim       = var.github_oidc_subject_claim
  ecr_nextjs_repository_name      = var.ecr_nextjs_repository_name
  ecr_nestjs_repository_name      = var.ecr_nestjs_repository_name

  common_tags = local.common_tags

  depends_on = [module.ecr]
}
```

### Terraform Variables（terraform.tfvars）

```hcl
project_name              = "danmaku"
environment               = "dev"
aws_region                = "ap-northeast-1"

# GitHub OIDC Subject Claim の例:
# "repo:hogecode/danmaku:*"               # すべてのブランチ
# "repo:hogecode/danmaku:ref:refs/heads/main"  # main ブランチのみ
github_oidc_subject_claim = "repo:hogecode/danmaku:*"

ecr_nextjs_repository_name = "ecs-nextjs"
ecr_nestjs_repository_name = "ecs-nestjs"
```

### GitHub Secrets の設定

Terraform apply 後、以下をGitHub リポジトリシークレットに設定:

```bash
# Terraform output から取得
cd infra/terraform
terraform output github_oidc_role_arn
terraform output ecs_cluster_name
terraform output ecs_nextjs_service_name
terraform output ecs_nestjs_service_name
```

| 変数名 | 値 |
|--------|-----|
| `AWS_REGION` | `ap-northeast-1` |
| `AWS_ACCOUNT_ID` | AWS Account ID |
| `AWS_ROLE_ARN` | terraform output から取得 |
| `ECR_NEXTJS_REPOSITORY_NAME` | `ecs-nextjs` |
| `ECR_NESTJS_REPOSITORY_NAME` | `ecs-nestjs` |
| `ECS_CLUSTER_NAME` | terraform output から取得 |
| `ECS_NEXTJS_SERVICE_NAME` | terraform output から取得 |
| `ECS_NESTJS_SERVICE_NAME` | terraform output から取得 |

## GitHub Actions ワークフロー

### 開発環境パイプライン（ci-dev.yml）

**トリガー**: `main` ブランチへの push

```yaml
name: CI/CD - Dev Environment

on:
  push:
    branches: [main]

jobs:
  test:     # Unit tests & linting
  build:    # Docker build & ECR push
  scan:     # Trivy vulnerability scan
  deploy:   # ECS deployment
```

### 本番環境パイプライン（ci-prod.yml）

**トリガー**: `v*` タグの push

```yaml
name: CI/CD - Production Environment

on:
  push:
    tags: ['v*']

jobs:
  test:     # Unit tests & linting
  build:    # Docker build & ECR push
  scan:     # Trivy vulnerability scan
  deploy:   # ECS deployment
```

## OIDC 認証フロー

### 1. GitHub Actions からの Token リクエスト

```yaml
- name: Configure AWS credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ${{ secrets.AWS_REGION }}
```

### 2. トークンの検証

AWS は以下を検証：
- **Issuer**: https://token.actions.githubusercontent.com
- **Subject Claim**: `repo:hogecode/danmaku:*`
- **Audience**: sts.amazonaws.com

### 3. 短期認証情報の発行

- **有効期限**: 15分（デフォルト）
- **権限範囲**: IAM ロールのポリシーに限定
- **監査ログ**: CloudTrail に記録

## IAM ポリシー

このモジュールで付与される権限：

### ECR プッシュ権限
```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetDownloadUrlForLayer",
    "ecr:BatchGetImage",
    "ecr:PutImage",
    "ecr:InitiateLayerUpload",
    "ecr:UploadLayerPart",
    "ecr:CompleteLayerUpload",
    "ecr:GetAuthorizationToken"
  ],
  "Resource": "arn:aws:ecr:*:*:repository/*"
}
```

### ECS デプロイ権限
```json
{
  "Effect": "Allow",
  "Action": [
    "ecs:DescribeServices",
    "ecs:DescribeTaskDefinition",
    "ecs:DescribeContainerInstances",
    "ecs:UpdateService",
    "ecs:RegisterTaskDefinition",
    "iam:PassRole"
  ],
  "Resource": "*"
}
```

## セキュリティベストプラクティス

### ✅ 推奨事項

1. **Subject Claim の制限**
   ```hcl
   # 特定のブランチに限定
   github_oidc_subject_claim = "repo:hogecode/danmaku:ref:refs/heads/main"
   ```

2. **IAM ポリシーの最小化**
   - 必要なアクションのみを許可
   - リソース ARN を指定

3. **Secret の管理**
   - AWS_ROLE_ARN のみをシークレット化
   - 定期的なローテーション

4. **監査ログの確認**
   ```bash
   aws cloudtrail lookup-events \
     --lookup-attributes AttributeKey=PrincipalName,AttributeValue=github-actions-cicd-*
   ```

### ❌ 回避すべきこと

- ❌ アクセスキー/シークレットキーの保存
- ❌ `*:*` のようなワイルドカード権限
- ❌ 本番環境への無制限アクセス

## トラブルシューティング

### 問題: OIDC Token 取得失敗

```
error: RequestError: Failed to retrieve sts:GetCallerIdentity
```

**解決策**:
1. GitHub OIDC Provider が存在するか確認
2. Subject Claim の形式を確認
3. CloudTrail でエラー詳細を確認

```bash
# OIDC Provider の確認
aws iam list-open-id-connect-providers

# Subject Claim の確認
aws iam get-open-id-connect-provider \
  --open-id-connect-provider-arn arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com
```

### 問題: ECR Push 失敗

```
error: ECR_PUSH_ERROR - no credentials found
```

**解決策**:
1. IAM Role の ECR ポリシーを確認
2. ECR リポジトリが存在するか確認
3. AWS クレデンシャルが正しく設定されているか確認

```bash
# Role のポリシーを確認
aws iam list-role-policies --role-name github-actions-cicd-*
```

### 問題: ECS デプロイ失敗

```
error: Service not found or invalid task definition
```

**解決策**:
1. ECS クラスター/サービス名を確認
2. IAM Role が iam:PassRole 権限を持つか確認
3. タスク定義が最新化されているか確認

```bash
# サービスの確認
aws ecs describe-services \
  --cluster CLUSTER_NAME \
  --services SERVICE_NAME
```

## ログと監視

### CloudWatch Logs

- GitHub Actions ワークフロー実行ログ: GitHub Actions タブ
- AWS API 呼び出し: CloudTrail

### CloudTrail イベント確認

```bash
# GitHub Actions からの API 呼び出しを確認
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=PrincipalArn,AttributeValue=arn:aws:iam::ACCOUNT:role/github-actions-cicd-* \
  --max-results 50
```

## 参考資料

- [GitHub Actions の OpenID Connect](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [AWS IAM OIDC プロバイダー](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [AWS CLI CodeQL](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/iam/create-open-id-connect-provider.html)
