# CI/CD パイプライン実装ガイド

## 概要

このガイドでは、GitHub、AWS CodeBuild、AWS CodeDeploy、AWS CodePipeline を統合した自動 CI/CD パイプラインの実装方法を説明します。

## ファイル構成

```
ecs-sample/
├── buildspec.yaml                    # CodeBuild ビルド定義（Docker イメージビルド）
├── buildspec-scan.yaml              # CodeBuild ビルド定義（Trivy セキュリティスキャン）
├── appspec.yaml                     # CodeDeploy デプロイメント定義
└── terraform/
    └── modules/
        └── cicd/
            ├── main.tf              # CI/CD リソース定義
            ├── variables.tf         # 変数定義
            ├── outputs.tf          # 出力定義
            └── README.md           # モジュール説明書
```

## クイックスタート

### 1. Terraform に CI/CD モジュールを追加

`terraform/main.tf` に以下を追加：

```hcl
# ========================================
# Phase 12: CI/CD Pipeline Configuration
# ========================================
module "cicd" {
  source = "./modules/cicd"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region

  # GitHub Configuration
  github_owner             = "hogecode"
  github_repo              = "ecs-sample"
  github_token             = var.github_token
  github_branch_develop    = "develop"
  github_branch_main       = "main"

  # ECR Configuration
  ecr_repository_name      = var.ecr_repository_name

  # ECS Configuration
  ecs_cluster_name         = module.ecs.cluster_name
  ecs_service_name         = module.ecs.service_name
  ecs_task_definition_family = "ecs-sample"

  # ALB Configuration
  alb_target_group_arn     = module.alb.target_group_arn

  # Artifact Storage
  artifact_bucket_name     = module.storage.artifact_bucket_name
  kms_key_id              = module.storage.kms_key_id

  # CodeBuild Configuration
  codebuild_environment_compute_type = var.environment == "prod" ? "BUILD_GENERAL1_LARGE" : "BUILD_GENERAL1_MEDIUM"
  codebuild_environment_image        = "aws/codebuild/standard:5.0"
  codebuild_privileged_mode          = true

  # CodeDeploy Configuration
  enable_manual_approval   = var.environment == "prod" ? true : false

  # Tags
  common_tags              = local.common_tags

  depends_on = [module.ecs, module.alb, module.storage]
}
```

### 2. Terraform 変数を定義

`terraform/variables.tf` に以下を追加：

```hcl
variable "github_token" {
  description = "GitHub personal access token for CodePipeline"
  type        = string
  sensitive   = true
}
```

### 3. GitHub Token を設定

```bash
# GitHub で Personal Access Token を生成
# Settings → Developer settings → Personal access tokens → Generate new token
# 権限: repo, admin:repo_hook

# Terraform 変数として設定
export TF_VAR_github_token="ghp_xxxxxxxxxxxxxxxxxxxx"

# または tfvars ファイルに追加
echo 'github_token = "ghp_xxxxxxxxxxxxxxxxxxxx"' >> terraform/environments/prod.tfvars
```

### 4. Terraform を実行

```bash
cd terraform

# ステージング環境
terraform plan -var-file="environments/staging.tfvars"
terraform apply -var-file="environments/staging.tfvars"

# 本番環境
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

## パイプラインの動作フロー

### ステージング環境（develop ブランチ）

```
1. 開発者が feature ブランチから develop ブランチへプッシュ
   ↓
2. GitHub Actions で簡易検証（Lint, Unit Test）
   ↓
3. develop ブランチへマージ
   ↓
4. CodePipeline トリガー
   ↓
5. Build ステージ
   - buildspec.yaml 実行
   - Docker イメージビルド
   - ECR にプッシュ
   ↓
6. Scan ステージ
   - buildspec-scan.yaml 実行
   - Trivy でセキュリティスキャン
   - 脆弱性チェック
   ↓
7. Deploy ステージ
   - CodeDeploy でステージング環境へ自動デプロイ
   - AllAtOnce（全タスクを同時更新）
   - 自動ロールバック有効
   ↓
8. ステージング環境で検証
```

### 本番環境（main ブランチ）

```
1. リリース準備
   - release ブランチ作成
   - バージョン更新
   ↓
2. release → main へマージ
   ↓
3. タグ作成・プッシュ（v1.0.0）
   ↓
4. CodePipeline トリガー
   ↓
5. Build ステージ
   - buildspec.yaml 実行
   - Docker イメージビルド
   - ECR にプッシュ
   ↓
6. Scan ステージ
   - buildspec-scan.yaml 実行
   - Trivy でセキュリティスキャン
   ↓
7. Approval ステージ
   - マニュアル承認待機
   - AWS マネージメントコンソール で承認
   ↓
8. Deploy ステージ
   - CodeDeploy で本番環境へカナリアデプロイ
   - Canary: 10% → 5分待機 → 90%
   - CloudWatch メトリクス監視
   ↓
9. 本番環境で稼動
```

## 主要なファイルの説明

### buildspec.yaml（Docker ビルド）

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      # ECR へのログイン
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | \
        docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      # 環境変数設定
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}

  build:
    commands:
      # Docker イメージビルド
      - docker build -t $REPOSITORY_URI:$IMAGE_TAG -t $REPOSITORY_URI:latest .

  post_build:
    commands:
      # ECR にプッシュ
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - docker push $REPOSITORY_URI:latest
      # タスク定義用の JSON 生成
      - printf '[{"name":"ecs-sample-container","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

**環境変数（CodeBuild プロジェクトで設定）:**

- `AWS_DEFAULT_REGION`: ap-northeast-1
- `AWS_ACCOUNT_ID`: 123456789012
- `IMAGE_REPO_NAME`: ecs-sample

### buildspec-scan.yaml（セキュリティスキャン）

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      # Trivy インストール
      - apt-get update && apt-get install -y trivy

  build:
    commands:
      # イメージスキャン実行
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
      - trivy image --severity HIGH,CRITICAL $REPOSITORY_URI:$IMAGE_TAG
      # CRITICAL 脆弱性があったら失敗
      - |
        CRITICAL_COUNT=$(trivy image --severity CRITICAL --format json $REPOSITORY_URI:$IMAGE_TAG | \
          jq '[.Results[]? | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity == "CRITICAL")] | length')
        if [ "$CRITICAL_COUNT" -gt 0 ]; then
          echo "CRITICAL vulnerabilities detected! Build failing."
          exit 1
        fi

artifacts:
  files:
    - scan-results.json
```

**脆弱性ポリシー:**

- **CRITICAL**: デプロイ停止、即座に対応
- **HIGH**: デプロイ停止、48時間以内に対応
- **MEDIUM**: ログ記録、次のパッチで対応

### appspec.yaml（ECS デプロイメント）

```yaml
version: 0.0

Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: "arn:aws:ecs:ap-northeast-1:ACCOUNT_ID:task-definition/ecs-sample:REVISION"
        LoadBalancerInfo:
          ContainerName: "ecs-sample-container"
          ContainerPort: 8080
        PlatformVersion: "1.4.0"
        NetworkConfiguration:
          AwsvpcConfiguration:
            Subnets:
              - "PRIVATE_API_SUBNET_1"
              - "PRIVATE_API_SUBNET_2"
            SecurityGroups:
              - "GO_SERVER_SECURITY_GROUP"
            AssignPublicIp: "DISABLED"
```

## デプロイメント手順

### ステージング環境への手動デプロイ

```bash
# 最新コードを develop にプッシュ
git checkout develop
git pull origin develop
git push origin develop

# CodePipeline が自動開始される
# AWS コンソール で進行状況を確認
aws codepipeline get-pipeline-state --name ecs-sample-staging-pipeline
```

### 本番環境へのリリース

```bash
# 1. リリースブランチ作成
git checkout -b release/1.0.0 develop

# 2. バージョン更新
echo "1.0.0" > version.txt
git add version.txt
git commit -m "Bump version to 1.0.0"

# 3. main へマージ
git checkout main
git merge --no-ff release/1.0.0

# 4. タグ作成
git tag -a v1.0.0 -m "Release v1.0.0"

# 5. GitHub にプッシュ
git push origin main --tags

# 6. CodePipeline が自動開始
# AWS コンソール で進行状況を確認
# Build → Scan → Approval (待機中)

# 7. マニュアル承認（AWS コンソール）
# CodePipeline → ecs-sample-prod-pipeline → Approval ステージで承認

# 8. Deploy ステージ開始
# Canary デプロイ: 10% → 5分待機 → 90%
```

## トラブルシューティング

### CodeBuild ビルド失敗

**ログ確認:**

```bash
aws logs tail /aws/codebuild/ecs-sample-staging-build --follow
```

**一般的な問題:**

1. **ECR 認証エラー**
   - IAM ロール権限確認
   - `ecr:GetAuthorizationToken` が許可されているか確認

2. **Docker ビルドエラー**
   - Dockerfile が存在するか確認
   - 依存パッケージがインストールされているか確認

3. **ディスク容量不足**
   - CodeBuild コンピュートタイプをアップグレード
   - Docker キャッシュをクリア

### Trivy スキャン失敗

**スキャン結果確認:**

```bash
aws logs tail /aws/codebuild/ecs-sample-staging-scan --follow
```

**脆弱性対応:**

```bash
# 1. ベースイメージを最新化
FROM ubuntu:22.04  # → FROM ubuntu:24.04

# 2. 依存パッケージをアップデート
RUN apt-get update && apt-get upgrade -y

# 3. 不要なパッケージを削除
RUN apt-get remove -y unnecessary-package
```

### CodeDeploy デプロイ失敗

**デプロイ状態確認:**

```bash
aws deploy describe-deployment --deployment-id d-XXXXXXXXXXXXX

aws ecs describe-services --cluster ecs-sample-staging --services ecs-sample
```

**ECS タスク定義確認:**

```bash
aws ecs describe-task-definition --task-definition ecs-sample:1
```

**ロールバック:**

```bash
# 前のバージョンにロールバック
aws deploy stop-deployment --deployment-id d-XXXXXXXXXXXXX --auto-rollback-enabled
```

## セキュリティベストプラクティス

### 1. GitHub Token 管理

```bash
# AWS Secrets Manager で管理
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "ghp_xxxxxxxxxxxxxxxxxxxx"

# Terraform で参照
data "aws_secretsmanager_secret_version" "github_token" {
  secret_id = "github-token"
}
```

### 2. IAM ロール権限

```hcl
# 最小権限の原則に従う
# - CodeBuild: ECR, S3, CloudWatch Logs のみ
# - CodePipeline: CodeBuild, CodeDeploy, S3 のみ
# - CodeDeploy: ECS のみ
```

### 3. 脆弱性スキャン

```bash
# 全イメージを自動スキャン
trivy image --severity HIGH,CRITICAL $REPOSITORY_URI:$IMAGE_TAG

# 定期的なスキャン
# CodeBuild ScheduleExpression: cron(0 2 * * ? *)  # 毎日 2:00 UTC
```

### 4. マニュアル承認

```hcl
# 本番環境へのデプロイには必ず承認を必須化
enable_manual_approval = var.environment == "prod" ? true : false
```

## パフォーマンス最適化

### CodeBuild キャッシュ

```yaml
cache:
  paths:
    - '/root/.docker/**/*'          # Docker レイヤーキャッシュ
    - '/root/.npm/**/*'              # npm キャッシュ
    - '/root/.cache/pip/**/*'        # Python pip キャッシュ
```

### ECR イメージサイズ削減

```dockerfile
# マルチステージビルド
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN go build -o app .

FROM gcr.io/distroless/base
COPY --from=builder /app/app /app
ENTRYPOINT ["/app"]
```

## 監視とアラート

### CloudWatch Alarms

```bash
# CodeBuild 失敗アラーム
aws cloudwatch put-metric-alarm \
  --alarm-name codebuild-failures \
  --alarm-description "Alert on CodeBuild failures" \
  --metric-name FailedBuilds \
  --namespace AWS/CodeBuild \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold

# CodePipeline 失敗アラーム
aws cloudwatch put-metric-alarm \
  --alarm-name codepipeline-failures \
  --alarm-description "Alert on CodePipeline failures" \
  --metric-name PipelineExecutionFailure \
  --namespace AWS/CodePipeline \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold
```

## 参考資料

- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/)
- [AWS CodeDeploy Documentation](https://docs.aws.amazon.com/codedeploy/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
