# 🚀 GitHub Actions + OIDC CI/CD パイプライン セットアップガイド

Terraform のみで GitHub Actions + OIDC CI/CD パイプラインを完全セットアップします。

---

## 前提条件

- ✅ AWS アカウント（管理権限）
- ✅ AWS CLI v2 がインストール済み
- ✅ Terraform v1.5以上
- ✅ GitHub リポジトリ（Admin権限）

---

## ⚡ クイックスタート（3ステップ）

### ステップ 1: terraform.tfvars を作成

`infra/terraform/terraform.tfvars`:

```hcl
aws_region                = "ap-northeast-1"
project_name              = "danmaku"
environment               = "dev"
github_oidc_subject_claim = "repo:hogecode/danmaku:*"
ecr_nextjs_repository_name = "ecs-nextjs"
ecr_nestjs_repository_name = "ecs-nestjs"
vpc_cidr                  = "10.0.0.0/16"
db_name                   = "danmakudb"
db_username               = "admin"
```

**重要**: `github_oidc_subject_claim` は `repo:組織/リポジトリ:*` の形式で設定

### ステップ 2: Terraform Apply

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

Terraform が以下を自動で作成します：
- ✅ GitHub OIDC Provider（TLS証明書から thumbprint を動的取得）
- ✅ GitHub Actions 用 IAM ロール
- ✅ ECR・ECS など その他 AWS リソース

### ステップ 3: GitHub Secrets を設定

```bash
# Terraform output から値を取得
terraform output -json
```

以下を GitHub Secrets に設定:

| 変数名 | 取得コマンド |
|--------|---------|
| `AWS_REGION` | 手動: `ap-northeast-1` |
| `AWS_ACCOUNT_ID` | `aws sts get-caller-identity --query Account` |
| `AWS_ROLE_ARN` | `terraform output github_oidc_role_arn` |
| `ECR_NEXTJS_REPOSITORY_NAME` | 手動: `ecs-nextjs` |
| `ECR_NESTJS_REPOSITORY_NAME` | 手動: `ecs-nestjs` |
| `ECS_CLUSTER_NAME` | `terraform output ecs_cluster_name` |
| `ECS_NEXTJS_SERVICE_NAME` | `terraform output ecs_nextjs_service_name` |
| `ECS_NESTJS_SERVICE_NAME` | `terraform output ecs_nestjs_service_name` |

**GitHub UI で設定** (Settings → Secrets and variables → Actions)

---

## ✅ ワークフローのテスト

### Dev 環境（main ブランチ）

```bash
git add .
git commit -m "Initial CI/CD setup"
git push origin main
```

### Prod 環境（v* タグ）

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 実行状況確認

GitHub リポジトリ → **Actions** タブで確認

期待される流れ:
```
✅ test → ✅ build → ✅ scan → ✅ deploy
```

---

## 📝 何が自動的に行われるのか

Terraform apply で以下がすべて作成されます：

```
infra/terraform/modules/cicd/main.tf で:
  1. data.tls_certificate: GitHub OIDC の TLS 証明書から thumbprint を取得
  2. aws_iam_openid_connect_provider: GitHub OIDC Provider を作成
  3. aws_iam_role: GitHub Actions 用 IAM ロール作成
  4. aws_iam_role_policy: ECR Push・ECS Update の権限設定
```

**Bootstrap スクリプトは不要です**（Terraform で全て完結）

---

## 🔍 トラブルシューティング

### Terraform Apply に失敗

```bash
# AWS 認証情報を確認
aws sts get-caller-identity

# Terraform 変数を確認
terraform plan -var-file=terraform.tfvars
```

### GitHub Actions が失敗

GitHub Actions ログを確認:

```
Actions タブ → 実行中のワークフロー → ジョブのログ
```

詳細は `TROUBLESHOOTING.md` を参照

---

## 📚 詳細情報

- **CI/CD モジュール**: `infra/terraform/modules/cicd/README.md`
- **GitHub Actions ワークフロー**: `.github/workflows/`
- **トラブルシューティング**: `TROUBLESHOOTING.md`

---

**セットアップ完了！** 🎉
