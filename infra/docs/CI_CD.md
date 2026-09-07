# CI/CDパイプライン

## 概要

このプロジェクトはGitFlow戦略を採用し、GitHub ActionsとAWS CodePipeline、CodeBuild、CodeDeployを組み合わせたCI/CDパイプラインを実装しています。

## ブランチ戦略（GitFlow）

### ブランチ構成

```
main (本番)
  ├── release/x.y.z
  │
develop (ステージング)
  ├── feature/xxx
  │   └── origin/feature/xxx
  │
hotfix/xxx (本番パッチ)
```

### ブランチ説明

| ブランチ | 用途 | 環境 | デプロイ | 説明 |
|---------|------|------|--------|------|
| `main` | 本番リリース | Production | 自動 | 安定版のみ。タグ付きリリース |
| `develop` | 開発統合 | Staging | 自動 | 次バージョン開発の統合ブランチ |
| `feature/*` | 機能開発 | Development | - | 個別機能開発用。develop から分岐 |
| `release/*` | リリース準備 | Staging | 自動 | バージョンアップ準備。develop から分岐 |
| `hotfix/*` | 緊急修正 | Production | 自動 | 本番バグ修正。main から分岐 |

### マージフロー

```
feature ブランチ
    ↓ (PR)
  develop ブランチ (GitHub Actions: 簡単なコード検証)
    ↓ (マージ時)
  AWS CodePipeline 開始
    ↓
  ステージング環境へ自動デプロイ
    ↓
  本番への昇格待ち
    ↓
develop → release ブランチ
    ↓
release → main ブランチ (PR)
    ↓ (マージ時)
  AWS CodePipeline 開始
    ↓
  本番環境へ自動デプロイ
```

## GitHub Actions（簡易 CI）

### 実行タイミング

- **Pull Request**: feature ブランチ → develop へのPR（コード検証）
- **定期実行**: 実施しない（CodeBuild で実施）

### CI ワークフロー

#### Pull Request チェック（簡易版）

**ファイル**: `.github/workflows/pr-check.yml`

```yaml
name: PR Code Check
on:
  pull_request:
    branches: [develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Linter
        run: |
          # Go の場合
          go fmt ./...
          go vet ./...
          
          # Next.js の場合
          npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: |
          # 簡単なユニットテストのみ
          go test -v ./...
          # または
          npm test -- --coverage

  notify:
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify PR Status
        uses: actions/github-script@v6
        with:
          script: |
            console.log('PR チェック完了')
```

### GitHub Actions シークレット設定

```
不要（CodePipeline で AWS 認証）
```

## AWS CodePipeline（CD）

### パイプライン構成

```
ソース（GitHub）
  ↓ (develop / main ブランチ)
ビルド（CodeBuild）
  ↓ (Docker イメージビルド)
セキュリティスキャン（CodeBuild）
  ↓ (Trivy でスキャン)
デプロイ - ステージング（CodeDeploy）
  ↓ (ECS にデプロイ)
マニュアル承認
  ↓
デプロイ - 本番（CodeDeploy）
  ↓ (ECS にデプロイ)
完了
```

### ステージング環境パイプライン

**パイプライン名**: `ecs-staging-pipeline`

#### Source ステージ

- **プロバイダ**: GitHub (OAuth)
- **リポジトリ**: `hogecode/ecs-sample`
- **ブランチ**: `develop`
- **トリガー**: Git プッシュ（develop ブランチへのマージ）

#### Build ステージ

- **プロバイダ**: CodeBuild
- **プロジェクト**: `ecs-staging-build`
- **buildspec.yml**:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo "Logging in to ECR..."
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | \
        docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/ecs-sample
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}

  build:
    commands:
      - echo "Building Docker image on `date`"
      - docker build -t $REPOSITORY_URI:$IMAGE_TAG .
      - docker tag $REPOSITORY_URI:$IMAGE_TAG $REPOSITORY_URI:latest

  post_build:
    commands:
      - echo "Pushing Docker image to ECR on `date`"
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - docker push $REPOSITORY_URI:latest
      - printf '[{"name":"ecs-sample-container","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json
      - cat imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json

cache:
  paths:
    - '/root/.docker/**/*'
```

#### Scan ステージ

- **プロバイダ**: CodeBuild
- **プロジェクト**: `ecs-staging-scan`
- **buildspec.yml**:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo "Installing Trivy..."
      - apt-get update && apt-get install -y wget
      - wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -
      - echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list
      - apt-get update && apt-get install -y trivy

  build:
    commands:
      - echo "Scanning Docker image..."
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/ecs-sample
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
      - trivy image --severity HIGH,CRITICAL $REPOSITORY_URI:$IMAGE_TAG
      - |
        SEVERITY_COUNT=$(trivy image --severity HIGH,CRITICAL --format json $REPOSITORY_URI:$IMAGE_TAG | \
          jq '.Results[] | select(.Vulnerabilities != null) | .Vulnerabilities | length' | \
          awk '{s+=$1} END {print s}')
        if [ "$SEVERITY_COUNT" -gt 0 ]; then
          echo "脆弱性が見つかりました: $SEVERITY_COUNT"
          exit 1
        fi

post_build:
  commands:
    - echo "Scan completed successfully"
```

#### Deploy ステージ

- **プロバイダ**: CodeDeploy
- **アプリケーション**: `ecs-sample-staging`
- **デプロイグループ**: `staging-deployment-group`
- **デプロイ設定**: `CodeDeployDefault.ECSAllAtOnce`

**appspec.yaml** (ECS デプロイメント用):

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: ecs-sample-staging:1
        LoadBalancerInfo:
          ContainerName: ecs-sample-container
          ContainerPort: 8080
        PlatformVersion: 1.4.0
        NetworkConfiguration:
          AwsvpcConfiguration:
            Subnets:
              - subnet-xxxxx
              - subnet-xxxxx
            SecurityGroups:
              - sg-xxxxx
            AssignPublicIp: DISABLED
```

### 本番環境パイプライン

**パイプライン名**: `ecs-production-pipeline`

#### Source ステージ

- **プロバイダ**: GitHub
- **リポジトリ**: `hogecode/ecs-sample`
- **ブランチ**: `main`
- **トリガー**: タグの作成（v*.*.* パターン）

#### Build / Scan ステージ

ステージング環境と同一

#### Approval ステージ

本番デプロイの前に**マニュアル承認**が必須

#### Deploy ステージ

- **プロバイダ**: CodeDeploy
- **アプリケーション**: `ecs-sample-production`
- **デプロイグループ**: `production-deployment-group`
- **デプロイ設定**: `CodeDeployDefault.ECSCanary10Percent5Minutes`
  - 段階的デプロイメント：10% → 5分待機 → 残り90%

## CodeBuild

### ビルドプロジェクト設定

#### ecs-staging-build

```
環境:
  - イメージ: aws/codebuild/standard:5.0
  - コンピュート: medium
  - 権限: CodeBuild サービスロール

環境変数:
  - AWS_DEFAULT_REGION: ap-northeast-1
  - AWS_ACCOUNT_ID: 123456789012
  - IMAGE_REPO_NAME: ecs-sample

ログ:
  - CloudWatch Logs: /aws/codebuild/ecs-staging-build
  - S3: arn:aws:s3:::artifact-bucket/codebuild/
```

#### ecs-staging-scan

```
環境:
  - イメージ: aws/codebuild/standard:5.0
  - コンピュート: small
  - 権限: CodeBuild サービスロール

ログ:
  - CloudWatch Logs: /aws/codebuild/ecs-staging-scan
```

#### ecs-production-build / ecs-production-scan

ステージング同一設定

## CodeDeploy

### デプロイメント設定

#### ステージング環境

```
デプロイグループ: staging-deployment-group
トラフィック制御: AllAtOnce
デプロイ失敗時: 自動ロールバック
```

#### 本番環境

```
デプロイグループ: production-deployment-group
トラフィック制御: Canary (10% → 5分待機 → 90%)
デプロイ失敗時: 自動ロールバック
```

### トラフィック切り替えロジック

1. **検証フェーズ**: 新タスク 10% にトラフィック送信
2. **待機**: 5分間メトリクス監視
3. **判定**: CloudWatch メトリクスが正常な場合、残り 90% に切り替え
4. **ロールバック**: 異常検出時は前バージョンに自動ロールバック

## デプロイメント手順

### 機能開発からステージング環境デプロイまで

```
1. feature ブランチ作成
   git checkout -b feature/new-feature develop

2. 開発・コミット・プッシュ
   git push origin feature/new-feature

3. GitHub で Pull Request 作成（develop 宛）
   - GitHub Actions が簡易的なコード検証（Lint, Unit Test）
   - テスト失敗時は PR マージ不可

4. レビュー・承認後、PR をマージ
   git merge --no-ff feature/new-feature develop

5. CodePipeline が自動開始
   - CodeBuild でビルド
   - CodeBuild でセキュリティスキャン（Trivy）
   - スキャン失敗時は脆弱性対応
   - ECR にプッシュ
   - CodeDeploy でステージング環境に自動デプロイ

6. ステージング環境での検証
```

### ステージングから本番環境デプロイまで

```
1. リリース準備（定期的 or 不定期）
   git checkout -b release/x.y.z develop

2. バージョン更新、リリースノート作成
   - version.txt 更新
   - CHANGELOG.md 更新
   - git commit

3. release ブランチを main にマージ
   git checkout main
   git merge --no-ff release/x.y.z

4. タグ作成・プッシュ
   git tag -a vx.y.z -m "Release vx.y.z"
   git push origin main --tags

5. GitHub で自動検出（main ブランチ + タグ）
   - CodePipeline が自動開始
   - CodeBuild でビルド
   - CodeBuild でセキュリティスキャン
   - ECR にプッシュ
   - CodeDeploy で本番環境に段階的デプロイ（要マニュアル承認）

6. マニュアル承認後、本番環境に完全デプロイ

7. release ブランチを develop に マージバック
   git checkout develop
   git merge --no-ff release/x.y.z
   git push origin develop
```

### 緊急パッチ（Hotfix）

```
1. hotfix ブランチ作成
   git checkout -b hotfix/critical-fix main

2. 修正・テスト・コミット
   git commit -m "Fix critical bug"

3. main に直接マージ
   git checkout main
   git merge --no-ff hotfix/critical-fix

4. タグ作成
   git tag -a vx.y.z-hotfix

5. develop にも マージ
   git checkout develop
   git merge --no-ff hotfix/critical-fix
   git push origin develop
```

## 環境別デプロイメント設定

### Development 環境

```
トリガー: 手動（CloudWatch Events + Lambda で期間制限）
デプロイ: オプション
自動停止: 22:00-09:00
```

### Staging 環境

```
トリガー: develop ブランチへのマージ
デプロイ: 自動
ローリングアップデート: AllAtOnce
セキュリティスキャン: 有効
```

### Production 環境

```
トリガー: main ブランチへのタグプッシュ
デプロイ: 自動（マニュアル承認必須）
ローリングアップデート: Canary (10% → 90%)
セキュリティスキャン: 有効
```

## トラブルシューティング

### デプロイメント失敗時

1. **CloudWatch Logs を確認**
   ```bash
   aws logs tail /aws/codebuild/ecs-staging-build --follow
   aws logs tail /aws/codebuild/ecs-staging-scan --follow
   ```

2. **CodeBuild 実行ログを確認**
   ```bash
   aws codebuild batch-get-builds --ids <build-id>
   ```

3. **ECS タスク定義を確認**
   ```bash
   aws ecs describe-task-definition --task-definition ecs-sample-staging:1
   ```

4. **CodeDeploy デプロイログを確認**
   ```bash
   aws deploy describe-deployment --deployment-id <deployment-id>
   ```

### セキュリティスキャン失敗時

1. **Trivy スキャンログ確認**
   ```bash
   aws logs tail /aws/codebuild/ecs-staging-scan --follow
   ```

2. **脆弱性対応**
   - 依存ライブラリをアップデート
   - Docker イメージのベースイメージを更新
   - 開発環境でローカルテスト

3. **スキャン失敗時のポリシー**
   - CRITICAL: デプロイ停止、即座に対応
   - HIGH: デプロイ停止、48時間以内に対応
   - MEDIUM: ログ記録、定期パッチで対応

## セキュリティベストプラクティス

- **環境変数**: AWS Secrets Manager で管理
- **アーティファクト**: 署名と暗号化を有効化
- **ロール**: IAM ロールベースの最小権限構成
- **ログ**: CloudWatch Logs で監査ログ保存
- **承認**: 本番デプロイは必ずマニュアル承認
- **スキャン**: すべてのコンテナイメージを自動スキャン

## 参考資料

- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/)
- [AWS CodeDeploy Documentation](https://docs.aws.amazon.com/codedeploy/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [GitFlow Workflow](https://www.atlassian.com/ja/git/tutorials/comparing-workflows/gitflow-workflow)
