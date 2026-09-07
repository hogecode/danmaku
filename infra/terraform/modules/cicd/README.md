# CI/CD Module

ECS Fargate へのマイクロサービスデプロイメント用の CI/CD パイプラインを実装します。

## 概要

このモジュールは以下を実装します：

- **GitHub Integration**: GitHub リポジトリからのソースコード取得
- **CodeBuild**: Docker イメージのビルドと ECR へのプッシュ
- **Security Scan**: Trivy を使用したコンテナイメージの脆弱性スキャン
- **CodeDeploy**: ECS Fargate への段階的デプロイメント
- **CodePipeline**: 自動化されたパイプラインオーケストレーション
- **Manual Approval**: 本番環境へのデプロイメント前に手動承認を必須に

## アーキテクチャ

```
GitHub Repository
    ↓
  Source (develop/main ブランチ)
    ↓
CodePipeline
    ├→ Build (CodeBuild)
    │   └→ buildspec.yaml: Docker イメージビルド & ECR プッシュ
    │
    ├→ Scan (CodeBuild)
    │   └→ buildspec-scan.yaml: Trivy セキュリティスキャン
    │
    ├→ Approval (本番のみ)
    │   └→ Manual Approval Gate
    │
    └→ Deploy (CodeDeploy)
        └→ ECS Fargate へのデプロイメント (Canary/AllAtOnce)
```

## 使用方法

### 基本的な呼び出し（main.tf）

```hcl
module "cicd" {
  source = "./modules/cicd"

  project_name             = var.project_name
  environment              = var.environment
  aws_region               = var.aws_region

  # GitHub Configuration
  github_owner             = "hogecode"
  github_repo              = "ecs-sample"
  github_token             = var.github_token  # Sensitive
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
  kms_key_id              = module.security_group.s3_filesystem_kms_key_arn

  # CodeBuild Configuration
  codebuild_environment_compute_type = "BUILD_GENERAL1_MEDIUM"
  codebuild_environment_image        = "aws/codebuild/standard:5.0"
  codebuild_privileged_mode          = true

  # CodeDeploy Configuration
  enable_manual_approval   = true

  # Tags
  common_tags              = local.common_tags
}
```

## 環境変数設定

### Terraform Variables

```bash
# GitHub Token (必須)
export TF_VAR_github_token="ghp_xxxxxxxxxxxxxxxxxxxx"

# 環境ごとの設定例
terraform apply -var-file="environments/staging.tfvars"
terraform apply -var-file="environments/prod.tfvars"
```

### CodeBuild 環境変数

CodeBuild プロジェクトで以下の環境変数が自動設定されます：

- `AWS_DEFAULT_REGION`: ap-northeast-1
- `AWS_ACCOUNT_ID`: 現在のアカウント ID
- `IMAGE_REPO_NAME`: ecs-sample

## Buildspec ファイル

### buildspec.yaml (Docker イメージビルド)

リポジトリルートに配置：

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | \
        docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  
  build:
    commands:
      - docker build -t $REPOSITORY_URI:$IMAGE_TAG .
  
  post_build:
    commands:
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - printf '[{"name":"ecs-sample-container","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
```

### buildspec-scan.yaml (セキュリティスキャン)

リポジトリルートに配置：

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - apt-get update && apt-get install -y trivy
  
  build:
    commands:
      - trivy image --severity HIGH,CRITICAL $REPOSITORY_URI:$IMAGE_TAG
      - |
        CRITICAL_COUNT=$(trivy image --severity CRITICAL --format json $REPOSITORY_URI:$IMAGE_TAG | \
          jq '[.Results[]? | select(.Vulnerabilities != null) | .Vulnerabilities[] | select(.Severity == "CRITICAL")] | length')
        if [ "$CRITICAL_COUNT" -gt 0 ]; then
          echo "CRITICAL vulnerabilities detected!"
          exit 1
        fi

artifacts:
  files:
    - scan-results.json
```

## AppSpec ファイル

### appspec.yaml (ECS デプロイメント設定)

リポジトリルートに配置：

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

Hooks:
  - BeforeInstall: "pre-install-hook"
  - AfterInstall: "post-install-hook"
  - BeforeAllowTraffic: "pre-traffic-hook"
  - AfterAllowTraffic: "post-traffic-hook"
```

## デプロイメント戦略

### ステージング環境

- **トリガー**: develop ブランチへのマージ
- **デプロイ方式**: AllAtOnce（すべてのトラフィックを即座に切り替え）
- **ロールバック**: 自動ロールバック有効（失敗時）

### 本番環境

- **トリガー**: main ブランチへのタグプッシュ（v*.*.* パターン）
- **デプロイ方式**: Canary（10% → 5分待機 → 90%）
- **承認**: マニュアル承認必須
- **ロールバック**: 自動ロールバック有効（失敗時）

## ログと監視

### CloudWatch Logs

- **ビルドログ**: `/aws/codebuild/ecs-sample-{env}-build`
- **スキャンログ**: `/aws/codebuild/ecs-sample-{env}-scan`
- **ECS ログ**: `/ecs/{service}-{env}`

### CodePipeline 実行状態の確認

```bash
# パイプラインの最新実行状態を確認
aws codepipeline get-pipeline-state --name ecs-sample-staging-pipeline

# ビルドプロジェクトのログを確認
aws logs tail /aws/codebuild/ecs-sample-staging-build --follow

# CodeDeploy デプロイの状態を確認
aws deploy describe-deployment --deployment-id d-XXXXXXXXXXXXX
```

## トラブルシューティング

### CodeBuild ビルド失敗

1. CloudWatch Logs を確認
   ```bash
   aws logs tail /aws/codebuild/ecs-sample-staging-build --follow
   ```

2. ビルドプロジェクト詳細を確認
   ```bash
   aws codebuild batch-get-builds --ids <build-id>
   ```

3. IAM ロール権限を確認
   - ECR へのアクセス
   - S3 アーティファクト へのアクセス
   - CloudWatch Logs 書き込み権限

### セキュリティスキャン失敗

脆弱性が検出された場合：

1. スキャン結果を確認
   ```bash
   aws logs tail /aws/codebuild/ecs-sample-staging-scan --follow
   ```

2. 脆弱性対応
   - 依存ライブラリをアップデート
   - ベースイメージを最新化
   - 開発環境でローカルテスト

3. 必要に応じてポリシーを調整
   - CRITICAL: デプロイ停止、即座に対応
   - HIGH: デプロイ停止、48時間以内に対応

### CodeDeploy デプロイ失敗

1. デプロイ状態を確認
   ```bash
   aws deploy describe-deployment --deployment-id d-XXXXXXXXXXXXX
   ```

2. ECS サービス状態を確認
   ```bash
   aws ecs describe-services --cluster ecs-sample-staging --services ecs-sample
   ```

3. ロールバックを実行
   ```bash
   aws deploy continue-deployment --deployment-id d-XXXXXXXXXXXXX
   ```

## セキュリティベストプラクティス

- **GitHub Token**: AWS Secrets Manager で管理
- **アーティファクト**: KMS で暗号化
- **IAM ロール**: 最小権限の原則に従う
- **脆弱性スキャン**: すべてのイメージを自動スキャン
- **承認**: 本番環境へのデプロイは必ずマニュアル承認

## 参考資料

- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/)
- [AWS CodeDeploy Documentation](https://docs.aws.amazon.com/codedeploy/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
