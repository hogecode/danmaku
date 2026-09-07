# Terraform IaC - AWS ECS Architecture

このプロジェクトは、AWS ECS Fargate 上で動作するマイクロサービスアーキテクチャを IaC (Infrastructure as Code) で実装しています。Next.js フロントエンドと Go バックエンドサーバーをコンテナ化し、本番環境の高可用性と開発環境のコスト効率を両立させています。

## 📁 ディレクトリ構造

```
terraform/
├── provider.tf                 # AWS Provider 設定
├── variables.tf                # 環境共通の変数定義
├── outputs.tf                  # ルートモジュールの出力
├── locals.tf                   # ローカル値・計算ロジック
├── main.tf                     # ルートモジュール設定
├── versions.tf                 # Terraform & Provider バージョン
│
├── environments/               # 環境別変数ファイル
│   ├── dev.tfvars             # 開発環境変数
│   ├── staging.tfvars         # ステージング環境変数
│   └── prod.tfvars            # 本番環境変数
│
├── .gitignore                  # Git 除外設定
├── README.md                   # このファイル
├── IMPLEMENTATION_SUMMARY.md   # 実装概要
└── lambda_functions.json       # Lambda 関数設定
│
└── modules/                    # 機能別モジュール
    ├── network/
    │   ├── vpc/               # VPC・ネットワーク
    │   ├── alb/               # ロードバランサー（Public & Private）
    │   └── security_group/    # セキュリティグループ
    │
    ├── compute/
    │   ├── ecr/               # Elastic Container Registry
    │   ├── ecs/               # ECS Cluster & Services
    │   ├── bastion-ec2/       # Bastion ホスト（EC2）
    │   └── bastion-fargate/   # Bastion ホスト（Fargate）
    │
    ├── database/
    │   ├── rds/               # RDS MySQL/PostgreSQL
    │   └── cache/             # ElastiCache (Redis) ※未実装
    │
    ├── security/
    │   └── kms/               # KMS 暗号化キー
    │
    ├── storage/
    │   └── s3/                # S3 バケット
    │
    ├── monitoring/
    │   └── cloudwatch/        # CloudWatch ログ & アラーム
    │
    ├── cicd/                  # CI/CD パイプライン（CodePipeline, CodeBuild, CodeDeploy）
    │
    ├── lambda/                # Lambda 関数
    │
    └── messaging/
        ├── email/             # SES メールサービス ※未実装
        └── sqs/               # SQS メッセージキュー ※未実装
```

## 🚀 クイックスタート

### 前提条件

- Terraform >= 1.3
- AWS CLI configured with appropriate credentials
- AWS アカウントと適切な IAM 権限
- Docker（イメージのビルド時）

### インストール & 初期化

```bash
# Terraform ディレクトリに移動
cd terraform

# Terraform を初期化（モジュール・プロバイダーをダウンロード）
terraform init

# 環境変数ファイルのセットアップ
cp environments/dev.tfvars.sample environments/dev.tfvars

# GitHub token を dev.tfvars に追記
# editor environments/dev.tfvars
# github_token = "ghp_your_token_here" を追加
```

### 開発環境への デプロイ

```bash
# デプロイ前に確認
make tf.plan.dev

# デプロイ実行（プランから適用）
make tf.apply.dev

# または以下でワンステップで実行（推奨しない）
# cd terraform && terraform apply -var-file="environments/dev.tfvars" -auto-approve
```

### ステージング環境への デプロイ

```bash
# デプロイ前に確認
make tf.plan.staging

# ステージング環境へのデプロイは手動確認が推奨
# cd terraform && terraform apply tfplan
```

### 本番環境への デプロイ

```bash
# 本番環境は常に手動確認
make tf.plan.prod

# プランを確認して適用
# cd terraform && terraform apply tfplan
```

**注**: 各環境へのデプロイは Makefile で定義されています。詳細は `make help` を実行して確認してください。

## 📋 実装段階（Phases）

### ✅ Phase 1: ネットワーク基盤 (完了)

**モジュール**: `modules/network/vpc/`

**実装内容**:
- VPC（10.0.0.0/16）
- Public Subnets（ALB用、2 AZ）
- Private Subnets（3層構成：App、API、DB、各2 AZ）
- Internet Gateway
- NAT Gateway（環境別に数は変動）
- Route Tables（Public・Private）
- VPC Flow Logs（本番・ステージング環境で有効）
- VPC Endpoints
  - S3（Gateway）
  - DynamoDB（Gateway）
  - Secrets Manager（Interface）
  - ECR（Interface：ecr.api, ecr.dkr）
  - CloudWatch Logs（Interface）

**出力値**:
- `vpc_id`, `vpc_cidr`
- Subnet IDs（public, private_app, private_api, private_db）
- NAT Gateway IDs & Public IPs
- VPC Endpoint IDs

---

### ✅ Phase 2: セキュリティ & KMS (完了)

**モジュール**: 
- `modules/network/security_group/` 
- `modules/security/kms/`

**実装内容**:

**セキュリティグループ（6種類）**:
1. **ALB Public SG**: 80/443（インターネット）→ 3000（Next.js）
2. **Next.js SG**: 3000（ALB）→ 8080（Private ALB）、443（AWS APIs）
3. **Private ALB SG**: 8080（Next.js）→ 8080（Go Server）
4. **Go Server SG**: 8080（Private ALB）→ 3306/5432（RDS）、443（AWS APIs）
5. **RDS SG**: 3306/5432（Go Server、Bastion）← インバウンドのみ
6. **Bastion SG**: RDS/CloudWatch へのアウトバウンド

**KMS 暗号化**:
- S3（Artifact、State、Logs）
- RDS
- CloudWatch Logs
- Lambda 環境変数

**出力値**:
- 各 Security Group IDs
- KMS キー ARN & ID

---

### ✅ Phase 3: ロードバランサー (完了)

**モジュール**: `modules/network/alb/`

**実装内容**:
- **Public ALB**
  - 配置: Public Subnets
  - リスナー: HTTP/HTTPS (80, 443)
  - ターゲットグループ: Next.js ECS tasks (3000)
  - アクセスログ: S3（オプション）
  
- **Private ALB (Internal)**
  - 配置: Private Subnets (API Layer)
  - リスナー: HTTP (8080)
  - ターゲットグループ: Go Server ECS tasks (8080)
  - アクセス制御: Next.js SG のみ

**出力値**:
- ALB ARN & DNS 名
- ターゲットグループ ARN
- リスナー ARN

**依存関係**: Phase 1, 2

---

### ✅ Phase 4: コンテナ基盤 (完了)

#### 4a. ECR（Elastic Container Registry）

**モジュール**: `modules/compute/ecr/`

**実装内容**:
- Next.js リポジトリ（プライベート）
- Go Server リポジトリ（プライベート）
- イメージスキャン: 有効（プッシュ時）
- タグ不変性: 有効（上書き防止）
- ライフサイクルポリシー:
  - タグ付きイメージ: 最新10個保持
  - 非タグイメージ: 7日後に削除

#### 4b. ECS（Elastic Container Service）

**モジュール**: `modules/compute/ecs/`

**実装内容**:
- **ECS Cluster**
  - キャパシティプロバイダ: Fargate（基本）+ Fargate Spot（環境別）
  - Container Insights: 有効（本番・ステージング）
  
- **Next.js タスク定義**
  - CPU: 256 mCU, メモリ: 512 MB
  - ロギング: CloudWatch Logs (`/ecs/nextjs-{env}`)
  - ポート: 3000
  - 環境変数: API_BASE_URL, NEXT_PUBLIC_API_BASE_URL 等
  
- **Go Server タスク定義**
  - CPU: 512 mCU, メモリ: 1024 MB
  - ロギング: CloudWatch Logs (`/ecs/go-server-{env}`)
  - ポート: 8080
  - X-Ray Daemon: サイドカー構成（CPU 32, Memory 256）
  - 環境変数: RDS 接続情報等
  
- **ECS サービス**
  - Next.js: Public ALB に登録
  - Go Server: Private ALB に登録
  - オートスケーリング: ターゲット追跡型（CPU 70-75%）
  - デプロイメント設定: ローリング更新

#### 4c. Bastion EC2

**モジュール**: `modules/compute/bastion-ec2/`

**実装内容**:
- **デプロイ方法**: EC2 インスタンス（t3.micro）
- **配置**: Private Subnet (API Layer)
- **アクセス方法**: AWS Systems Manager Session Manager（SSH キー不要）
- **機能**:
  - RDS への直接接続（DB 管理タスク）
  - VPC 内リソース診断
  - 緊急対応・トラブルシューティング
  - 全セッション操作ログを CloudWatch Logs に自動記録

**セキュリティ**:
- IAM ロール: SSM Session Manager 権限
- セキュリティグループ: RDS + AWS APIs へのアウトバウンド
- CloudWatch Logs: セッション監査ログ保存

**依存関係**: Phase 1, 2, 3, ECR, RDS

---

### ✅ Phase 5: ストレージ (完了)

**モジュール**: `modules/storage/s3/`

**実装内容**:

#### Artifact Bucket
- **用途**: CodePipeline アーティファクト保存
- **暗号化**: SSE-KMS（カスタマーマネージド）
- **バージョニング**: 有効
- **アクセス制限**: CodePipeline ロールのみ
- **ライフサイクル**: 30日後に削除

#### Terraform State Bucket
- **用途**: Terraform 状態ファイル保存
- **暗号化**: SSE-KMS（カスタマーマネージド）
- **バージョニング**: 有効（状態復旧用）
- **MFA Delete**: 有効（本番環境）
- **アクセス制限**: Terraform 実行ロールのみ

#### Logs Bucket
- **用途**: ALB, WAF, CloudFront ログ保存
- **Intelligent-Tiering**: 有効（自動コスト最適化）
- **ライフサイクル**: 365日後に削除
- **暗号化**: SSE-KMS

#### File Upload Bucket
- **用途**: アプリケーションのファイルアップロード
- **暗号化**: SSE-KMS
- **CORS**: 有効（フロントエンドアクセス）
- **Lambda トリガー**: ファイル検証（オプション）

**出力値**:
- バケット ID & ARN
- KMS キー ID

**依存関係**: Phase 1, 2

---

### ✅ Phase 6: データベース (完了)

**モジュール**: `modules/database/rds/`

**実装内容**:
- **エンジン**: MySQL / PostgreSQL（環境選択可）
- **インスタンスタイプ**: db.t3.medium (本番), db.t3.small (dev/staging)
- **マルチAZ**: 有効（本番・ステージング）、無効（開発）
- **配置**: Private Subnet 3 (Data Layer)
- **自動バックアップ**: 7日保持（本番）、3日（開発）
- **暗号化**: 
  - 転送中: TLS 1.2+
  - 保存時: KMS
- **モニタリング**: Enhanced Monitoring, CloudWatch Metrics
- **Secrets Manager**: RDS マスターパスワード自動保存

**パラメータグループ**: 環境別最適化設定

**出力値**:
- DB インスタンスエンドポイント
- ポート番号
- Secrets Manager ARN

**依存関係**: Phase 1, 2

---

### ⏳ Phase 6 補足: ElastiCache (Redis) (未実装)

**モジュール**: `modules/database/cache/` （コメントアウト）

**実装予定**:
- Redis クラスタ（cache.t3.micro）
- Multi-AZ（フェイルオーバー）
- 自動バックアップ & スナップショット
- RDS とは別の セキュリティグループ

---

### ✅ Phase 7: 監視・ログ管理 (完了)

**モジュール**: `modules/monitoring/cloudwatch/`

**実装内容**:

**CloudWatch Logs**:
- ECS ログ: `/ecs/{app}-{env}` グループ
  - Next.js: `/ecs/nextjs-{env}` (保持: 14日)
  - Go Server: `/ecs/go-server-{env}` (保持: 14日)
  - Bastion: `/ecs/bastion-{env}` (保持: 30日・監査用)
- RDS ログ: `rds/{db-instance}/error`, slowquery (保持: 7日)
- Lambda ログ: `/aws/lambda/{function-name}` (保持: 3-14日)
- ログ暗号化: KMS キーで暗号化（本番環境）

**CloudWatch Container Insights**:
- ECS クラスタ、サービス、タスク レベルのメトリクス可視化
- CPU、メモリ、ネットワーク使用率のリアルタイム監視

**CloudWatch Alarms**:
- ECS: CPU > 80%, メモリ > 85%, タスク失敗率 > 5%
- RDS: CPU > 80%, 接続数 > 80, ストレージ < 10GB
- 通知先: SNS トピック → メール/Slack/PagerDuty

**X-Ray 分散トレース**:
- ECS タスク内に X-Ray Daemon サイドカー配置
- API 呼び出しの遅延箇所を可視化
- データベースクエリの性能分析

**CloudTrail**:
- IAM、RDS、ECS API 呼び出しの監査ログ
- 本番環境で有効推奨（S3 に 90日保存後 Glacier へ移行）

**出力値**:
- ログループ名
- アラーム ARN

**依存関係**: Phase 1-6

---

### ✅ Phase 8: CI/CD パイプライン (完了)

**モジュール**: `modules/cicd/`

**実装内容**:

**ソース管理**:
- GitHub 連携（OAuth）
- リポジトリ: `hogecode/ecs-sample`
- ブランチ戦略: GitFlow (main, develop, feature/*)

**CodeBuild Projects**:
1. **ecs-sample-{env}-build**: Docker イメージビルド + ECR プッシュ
   - buildspec.yaml 使用
   - Compute Type: 本番=Large, ステージング/開発=Medium
   - キャッシング: Docker レイヤーキャッシュ有効
   
2. **ecs-sample-{env}-scan**: Trivy セキュリティスキャン
   - buildspec-scan.yaml 使用
   - CRITICAL 脆弱性で自動失敗
   - 脆弱性ポリシー: CRITICAL/HIGH は対応必須

**CodeDeploy 設定**:
- ECS Fargate Blue/Green デプロイメント
- ステージング: AllAtOnce（全タスク同時更新）
- 本番: Canary（10%→5分待機→90%）
- 自動ロールバック: 有効（失敗時）

**CodePipeline ステージ**:
1. Source (GitHub) - develop/main ブランチ
2. Build (CodeBuild) - Docker イメージ作成
3. Scan (CodeBuild) - 脆弱性チェック
4. Approval (Manual) - 本番環境のみ
5. Deploy (CodeDeploy) - ECS にデプロイ

**IAM ロール**:
- CodeBuild Role: ECR, S3, CloudWatch Logs 権限
- CodePipeline Role: CodeBuild, CodeDeploy, S3, ECS 権限
- CodeDeploy Role: ECS 更新権限

**Artifact Storage**:
- S3 Bucket: `artifact-bucket-{env}`
- KMS 暗号化: 有効
- 保持期間: 30日

**出力値**:
- CodePipeline 名 & ARN
- CodeBuild プロジェクト名 & ARN

**依存関係**: Phase 1-7, ECS, ALB

---

### ✅ Phase 10: Lambda Functions (完了)

**モジュール**: `modules/lambda/`

**実装内容**:
- **動的デプロイメント**: lambda_functions.json 設定ファイルから自動生成
- **S3 トリガー**: ファイルアップロード検証・処理
- **実行環境**: Node.js（TypeScript）
- **ロギング**: CloudWatch Logs
- **IAM**: S3 読み取り権限（必要に応じて追加）

**設定ファイル**: `terraform/lambda_functions.json`

**出力値**:
- Lambda 関数 ARN & 名前
- S3 トリガー設定

**依存関係**: Storage (S3)

---

### ⏳ Phase 3 補足: SSL/TLS 証明書 (ACM) (未実装)

**モジュール**: `modules/cdn/certificates/` （コメントアウト）

**実装予定**:
- ACM での自動証明書作成
- Route53 での DNS 検証
- ALB への自動割り当て

---

### ⏳ Phase 9 補足: SES & SQS (未実装)

**モジュール**: 
- `modules/messaging/email/` （コメントアウト）
- `modules/messaging/sqs/` （コメントアウト）

**実装予定**:
- SES でのメール配信
- SQS メッセージキュー
- イベント駆動アーキテクチャ統合

---

## 🔧 環境変数ファイル（*.tfvars）

各環境に応じた変数オーバーライドが可能です：

### dev.tfvars（開発環境）
- Single AZ（コスト最適化）
- NAT Gateway: 1個
- ECS desired count: 1 / 最大 3
- Fargate Spot: 無効
- RDS: db.t3.small, Single-AZ
- VPC Flow Logs: 無効
- Logs retention: 3日
- Container Insights: 無効

### staging.tfvars（ステージング環境）
- Multi AZ（本番検証）
- NAT Gateway: 2個
- ECS desired count: 2 / 最大 6
- Fargate Spot: 80% weight
- RDS: db.t3.small, Single-AZ（コスト最適化）
- VPC Flow Logs: 無効
- Logs retention: 14日
- Container Insights: 有効

### prod.tfvars（本番環境）
- Multi AZ（高可用性）
- NAT Gateway: 2個
- ECS desired count: 3 / 最大 10
- Fargate Spot: 無効
- RDS: db.t3.medium, Multi-AZ
- VPC Flow Logs: 有効（セキュリティ監視）
- Logs retention: 30日
- Container Insights: 有効
- バックアップ保持期間: 7日

---

## 📊 状態管理（Terraform State）

### ローカル状態（開発時）

```bash
# デフォルトではローカルの terraform.tfstate に保存
terraform apply -var-file="environments/dev.tfvars"
```

### S3 バックエンド（推奨）

本番環境では S3 + DynamoDB Lock を使用してください：

```hcl
# provider.tf 内で設定（コメント化を削除）
terraform {
  backend "s3" {
    bucket         = "terraform-state-prod"
    key            = "terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

セットアップコマンド:

```bash
# 1. S3 バケット & DynamoDB テーブルを手動作成
aws s3api create-bucket \
  --bucket terraform-state-prod \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region ap-northeast-1

# 2. Backend を設定して migrate
terraform init
```

---

## 🏗️ システムアーキテクチャ

詳細なシステムアーキテクチャについては、`docs/ARCHITECTURE.md` を参照してください。

### 高レベルなトラフィックフロー

```
インターネット
    ↓
  [WAF（オプション）]
    ↓
[Public ALB - Public Subnet]
    ↓
[Next.js ECS - Private App Subnet]
    ↓
[Private ALB - Private API Subnet]
    ↓
[Go Server ECS - Private API Subnet]
    ↓
[RDS Multi-AZ - Private Data Subnet]
```

### アクセス制御

- Public ALB: インターネット (0.0.0.0/0) からのアクセスを受け入れ
- Next.js: Public ALB のセキュリティグループからのアクセスのみ
- Private ALB: Next.js のセキュリティグループからのアクセスのみ
- Go Server: Private ALB のセキュリティグループからのアクセスのみ
- RDS: Go Server と Bastion のセキュリティグループからのアクセスのみ
- Bastion: Session Manager（VPC Endpoint 経由）でアクセス

---


### 状態ファイルの保護

- S3 バックエンド設定で `encrypt = true`
- DynamoDB Lock で同時更新を防止
- S3 バージョニング有効化
- MFA Delete の有効化（本番環境）

### VPC セキュリティ設計

- **ネットワーク分離**: Public/Private サブネットによる3層構成
- **セキュリティグループ**: 最小権限の原則に基づく設定
- **VPC Endpoints**: AWS サービスへのプライベート通信
- **NAT Gateway**: Private サブネットからのアウトバウンド通信を制御
- **VPC Flow Logs**: ネットワークトラフィックの監視・監査

### コンテナセキュリティ

- **ECR イメージスキャン**: Trivy による脆弱性自動検出
- **読み取り専用ファイルシステム**: ECS タスク定義で有効化
- **Secrets Manager**: RDS パスワード等の機密情報管理
- **IAM ロール**: タスク実行ロール & タスクロールの分離
- **ログ暗号化**: CloudWatch Logs を KMS で暗号化

---

## 🧪 テスト & 検証

### Terraform Validate

```bash
cd terraform
terraform validate
```

### Terraform Format チェック

```bash
terraform fmt -check -recursive
```

### TFLint による Lint チェック

```bash
tflint --init
tflint
```

### Plan ファイルの生成 & 保存

```bash
# Plan ファイルを生成
terraform plan -var-file="environments/staging.tfvars" -out=tfplan

# 生成された Plan を確認
terraform show tfplan

# Plan を適用
terraform apply tfplan
```

---

## 📚 追加リファレンス

### プロジェクト内のドキュメント

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - 詳細なシステムアーキテクチャ設計
- **[docs/SECURITY.md](docs/SECURITY.md)** - セキュリティベストプラクティス
- **[docs/OPERATIONS.md](docs/OPERATIONS.md)** - 日常運用ガイド
- **[docs/CI_CD.md](docs/CI_CD.md)** - CI/CD パイプライン詳細
- **[docs/COST_MANAGEMENT.md](docs/COST_MANAGEMENT.md)** - コスト最適化戦略
- **[docs/DISASTER_RECOVERY.md](docs/DISASTER_RECOVERY.md)** - 災害復旧計画
- **[terraform/IMPLEMENTATION_SUMMARY.md](terraform/IMPLEMENTATION_SUMMARY.md)** - 実装概要

### 外部リソース

- [Terraform AWS Modules](https://registry.terraform.io/modules/terraform-aws-modules/)
- [Terraform AWS VPC Module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/best-practices.html)

---

## 🔍 トラブルシューティング

### 初期化エラー

```bash
# Provider / Module キャッシュをクリア
rm -rf .terraform

# 再度初期化
terraform init
```

### VPC Endpoint 作成エラー

VPC Endpoint をプライベートサブネットに作成する場合、DNS 有効化が必須：

```hcl
enable_dns_hostnames = true
enable_dns_support   = true
```

### IAM 権限不足

以下の IAM 権限が必要：
- `ec2:*`（VPC、Subnet、SG 等）
- `elasticloadbalancing:*`（ALB）
- `ecs:*`（ECS Cluster、Service）
- `ecr:*`（ECR）
- `rds:*`（RDS）
- `s3:*`（S3 buckets）
- `logs:*`（CloudWatch Logs）
- `kms:*`（KMS keys）
- `iam:*`（IAM roles）
- `codepipeline:*`、`codebuild:*`、`codedeploy:*`（CI/CD）

### ECS タスク起動失敗

- CloudWatch Logs で該当タスクのログを確認
- セキュリティグループの設定を確認
- ECR イメージアクセス権限を確認
- IAM タスク実行ロールの権限を確認

---

## 🤝 次のステップ

1. **Phase 3 補足（ACM）の実装**: 自動証明書管理と HTTPS の有効化
2. **Phase 6 補足（ElastiCache）の実装**: Redis キャッシュレイヤーの追加
3. **Phase 9 補足（SES/SQS）の実装**: メール送信とメッセージキューの統合
4. **CloudFront の追加**: CDN によるコンテンツ配信最適化
5. **WAF（Web Application Firewall）の追加**: DDoS 対策とセキュリティ強化
6. **バックアップ・ディザスタリカバリー**: 自動バックアップと復旧計画の策定
7. **コスト監視**: AWS Cost Explorer & Budgets の設定

---

## 📝 ドキュメント更新履歴

| 日付 | 変更内容 |
|-----|--------|
| 2026-05-01 | Phase 1-8, 10 の実装完了、README 全体更新 |
| 2026-04-20 | 初版作成：Phase 1-2 実装完了 |

---

**最終更新**: 2026-05-01

**質問・サポート**: docs/ 内の各ドキュメントを参照するか、プロジェクト管理者に連絡してください。
