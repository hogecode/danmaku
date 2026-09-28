# GitHub Actions CI/CD セットアップガイド

このガイドは、DanmakuプロジェクトのGitHub ActionsベースのCI/CDパイプラインをセットアップするための手順を説明します。

## 📋 目次

1. [前提条件](#前提条件)
2. [Repository Secretsの設定](#repository-secretsの設定)
3. [IAM ユーザーの作成](#iam-ユーザーの作成)
4. [ワークフローの確認](#ワークフローの確認)
5. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- GitHub リポジトリへの管理者アクセス
- AWS アカウントへのアクセス
- ECR リポジトリが作成済み
- ECS クラスター・サービスが構成済み

---

## Repository Secretsの設定

GitHub リポジトリの Settings → Secrets and variables → Actions から、以下の Secrets を設定してください。

### 必須 Secrets

| シークレット名 | 説明 | 例 |
|---|---|---|
| `AWS_REGION` | AWS リージョン | `ap-northeast-1` |
| `AWS_ACCOUNT_ID` | AWS アカウント ID | `123456789012` |
| `AWS_ACCESS_KEY_ID` | IAM ユーザーのアクセスキー ID | (AWS IAMで生成) |
| `AWS_SECRET_ACCESS_KEY` | IAM ユーザーのシークレットアクセスキー | (AWS IAMで生成) |
| `ECR_NEXTJS_REPOSITORY_NAME` | Next.js ECR リポジトリ名 | `danmaku-nextjs` |
| `ECR_NESTJS_REPOSITORY_NAME` | NestJS ECR リポジトリ名 | `danmaku-nestjs` |
| `ECS_CLUSTER_NAME` | ECS クラスター名 | `danmaku-cluster-dev` |
| `ECS_NEXTJS_SERVICE_NAME` | Next.js ECS サービス名 | `danmaku-nextjs-service` |
| `ECS_NESTJS_SERVICE_NAME` | NestJS ECS サービス名 | `danmaku-nestjs-service` |

### Secrets を設定する手順

1. GitHub リポジトリを開く
2. **Settings** タブをクリック
3. 左パネルから **Secrets and variables** → **Actions** を選択
4. **New repository secret** ボタンをクリック
5. Secret 名と値を入力して **Add secret** をクリック

---

## IAM ユーザーの作成

CI/CDパイプラインが AWS リソースにアクセスするため、専用の IAM ユーザーを作成します。

### IAM ユーザー作成手順

1. **AWS Console** → **IAM** → **Users** を開く
2. **Create user** をクリック
3. ユーザー名を入力（例：`github-actions-cicd`）
4. **Create user** をクリック
5. **Security credentials** タブで **Create access key** をクリック
6. **Access key** をコピーして GitHub Secrets に保存

### IAM ポリシーの設定

以下のポリシーを IAM ユーザーにアタッチしてください：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:BatchCheckLayerAvailability"
      ],
      "Resource": [
        "arn:aws:ecr:REGION:ACCOUNT_ID:repository/danmaku-nextjs",
        "arn:aws:ecr:REGION:ACCOUNT_ID:repository/danmaku-nextjs/*",
        "arn:aws:ecr:REGION:ACCOUNT_ID:repository/danmaku-nestjs",
        "arn:aws:ecr:REGION:ACCOUNT_ID:repository/danmaku-nestjs/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ecs-tasks.amazonaws.com"
        }
      }
    }
  ]
}
```

---

## ワークフローの確認

### Dev 環境（自動デプロイ）

**トリガー**: `main` ブランチへの push

```
Push to main
    ↓
Test (NestJS + Next.js)
    ↓
Build & Push to ECR
    ↓
Trivy Security Scan
    ↓
Deploy to ECS (rolling update)
```

**ファイル**: `.github/workflows/ci-dev.yml`

### Prod 環境（本番リリース）

**トリガー**: Git tag `v*.*.*` を push

```
Push git tag v*.*.* 
    ↓
Test (NestJS + Next.js)
    ↓
Build & Push to ECR (with version tag)
    ↓
Trivy Security Scan
    ↓
Deploy to ECS (rolling update)
    ↓
Create GitHub Release
```

**ファイル**: `.github/workflows/ci-prod.yml`

---

## トラブルシューティング

### "Failed to read variables file" エラー

**原因**: Makefile の Terraform パスが誤っている

**解決**: 以下のコマンドで修正

```bash
make tf.plan.dev  # 正常に実行されるようになります
```

### "Access Denied" エラー (ECR)

**原因**: IAM ポリシーが不足している

**解決**:
1. IAM ユーザーに前述のポリシーをアタッチ
2. `AWS_ACCESS_KEY_ID` と `AWS_SECRET_ACCESS_KEY` を更新

### "Task definition not found" エラー

**原因**: ECS タスク定義の名前が正しくない

**解決**:
1. ECS コンソールでタスク定義名を確認
2. `ECS_CLUSTER_NAME` Secrets を確認
3. ワークフロー内のスクリプトを確認

### Trivy スキャン結果がアップロードされない

**原因**: SARIF ファイル形式が正しくない

**解決**:
1. `trivy-action@master` のバージョン確認
2. GitHub リポジトリの **Security** タブでスキャン結果を確認

---

## 本番環境へのデプロイ

### 本番リリース手順

1. **develop ブランチで開発を完了**
2. **main ブランチにマージ**
3. **Git tag を作成**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. **GitHub Actions が自動的に以下を実行**:
   - テスト実行
   - Docker イメージビルド
   - Trivy スキャン
   - ECS へのデプロイ
   - GitHub Release の作成

---

## 参考資料

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECS Update Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/update-service.html)
- [Aqua Security Trivy](https://aquasecurity.github.io/trivy/)
