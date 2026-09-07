# Terraform AWS Modules

このディレクトリには、AWS インフラストラクチャを AWS サービス機能別に整理したモジュール化構成が含まれています。

## ディレクトリ構造

```
modules/
├── compute/              # ECS、コンテナ関連
│   ├── ecs/
│   ├── ecr/
│   └── autoscaling/
├── lambda/               # Lambda 関数
│   └── lambda/
├── network/              # ネットワーク・ロードバランサー・セキュリティ
│   ├── vpc/
│   ├── alb/
│   └── security_group/
├── cdn/                  # CDN・DNS・SSL 関連
│   ├── cloudfront/
│   ├── dns/
│   └── certificates/
├── database/             # データベース・キャッシュ
│   ├── rds/
│   └── cache/
├── secrets/              # シークレット管理
│   └── secrets-manager/
├── messaging/            # メッセージング・通信
│   ├── messaging/        (SQS)
│   └── email/
├── storage/              # ストレージ
│   └── storage/          (S3)
├── monitoring/           # モニタリング・ロギング
│   └── cloudwatch/
└── cicd/                 # CI/CD パイプライン
    └── cicd/
```

## モジュール一覧

### Compute Category

#### 1. ECS Module (`compute/ecs/`)
- Elastic Container Service（ECS）クラスタの管理
- Fargate/EC2 の両方に対応
- Container Insights 統合
- CloudWatch ログ統合

#### 2. ECR Module (`compute/ecr/`)
- Elastic Container Registry（ECR）リポジトリの管理
- イメージスキャン設定
- ライフサイクルポリシーの自動化

#### 3. Auto Scaling Module (`compute/autoscaling/`)
- Auto Scaling グループ管理
- スケーリングポリシー
- CloudWatch アラーム統合

### Lambda Category

#### Lambda Module (`lambda/lambda/`)
- AWS Lambda 関数の管理
- VPC 統合
- IAM ロール・ポリシーの自動管理
- EventBridge トリガー対応

### Network Category

#### 1. VPC Module (`network/vpc/`)
- VPC の管理
- サブネット（パブリック、プライベート）の設定
- NAT Gateway の設定
- VPC Flow Logs

#### 2. ALB Module (`network/alb/`)
- Application Load Balancer（ALB）の管理
- パブリックALB（フロントエンド向け）
- プライベートALB（バックエンド向け）
- ターゲットグループとリスナーの設定
- HTTPS/HTTP リダイレクション機能

#### 3. Security Group Module (`network/security_group/`)
- セキュリティグループの管理
- インバウンド・アウトバウンドルールの設定
- VPC エンドポイント用セキュリティグループ

### CDN Category

#### 1. CloudFront Module (`cdn/cloudfront/`)
- CloudFront ディストリビューション管理
- S3 オリジン設定
- キャッシュ動作設定
- SSL/TLS 設定

#### 2. Route53/DNS Module (`cdn/dns/`)
- Route53 DNS レコード管理
- A レコード、ワイルドカードレコード対応
- ヘルスチェック管理

#### 3. Certificates Module (`cdn/certificates/`)
- AWS Certificate Manager（ACM）の証明書管理
- DNS 検証の自動化

### Database Category

#### 1. RDS Module (`database/rds/`)
- Relational Database Service（RDS）インスタンス管理
- マルチ AZ 設定
- バックアップ・リカバリ設定
- パラメータグループ管理
- 拡張モニタリング

#### 2. ElastiCache Module (`database/cache/`)
- ElastiCache（Redis）クラスタの管理
- スナップショット設定
- メンテナンスウィンドウの設定

### Secrets Category

#### Secrets Manager Module (`secrets/secrets-manager/`)
- AWS Secrets Manager でのシークレット管理
- 暗号化されたシークレット保存
- 複数のシークレット構成対応

### Messaging Category

#### 1. SQS Module (`messaging/messaging/`)
- Simple Queue Service（SQS）の管理
- 標準キュー・FIFO キー対応
- KMS 暗号化設定
- デッドレターキュー設定

#### 2. SES Module (`messaging/email/`)
- Simple Email Service（SES）の管理
- ドメイン検証
- DKIM 設定

### Storage Category

#### S3 Module (`storage/storage/`)
- Simple Storage Service（S3）バケットの管理
- バージョニング設定
- ライフサイクルポリシー
- CloudFront 統合
- KMS 暗号化設定

### Monitoring Category

#### CloudWatch Module (`monitoring/cloudwatch/`)
- CloudWatch ロググループの管理
- CloudWatch メトリクスアラーム
- SNS トピックの管理
- CloudTrail ログの管理（オプション）
- ダッシュボード作成

### CI/CD Category

#### CI/CD Module (`cicd/cicd/`)
- GitHub との統合
- CodeBuild の設定
- CodeDeploy の設定
- CodePipeline の管理
- アーティファクト保存

## 使用方法

### モジュールの呼び出し例

```hcl
# ネットワーク関連
module "vpc" {
  source = "./modules/network/vpc"
  
  project_name      = var.project_name
  environment       = var.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = var.availability_zones
}

# コンピュート関連
module "ecs" {
  source = "./modules/compute/ecs"
  
  project_name        = var.project_name
  environment         = var.environment
  enable_container_insights = true
}

# データベース関連
module "rds" {
  source = "./modules/database/rds"
  
  project_name    = var.project_name
  environment     = var.environment
  rds_engine      = var.rds_engine
  rds_engine_version = var.rds_engine_version
}

# CDN 関連
module "cloudfront" {
  source = "./modules/cdn/cloudfront"
  
  project_name = var.project_name
  environment  = var.environment
}

# ストレージ関連
module "storage" {
  source = "./modules/storage/storage"
  
  app_name    = var.project_name
  environment = var.environment
}
```

## 環境変数の設定

各モジュールの `variables.tf` ファイルで定義されている変数をご確認ください。

## 出力値（Outputs）

各モジュールは以下の形式で出力値を提供します：

```hcl
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "s3_bucket_name" {
  value = module.storage.bucket_name
}
```

## セキュリティのベストプラクティス

1. **KMS 暗号化**: Secrets Manager、S3、RDS、CloudWatch ログは KMS キーで暗号化します
2. **IAM ロール**: ECS、Lambda に最小権限のロールを付与します
3. **セキュリティグループ**: ALB とリソース間の通信を制限します
4. **VPC**: Lambda と RDS を VPC 内に配置します
5. **VPC エンドポイント**: 外部通信を最小化するため VPC エンドポイントを利用します

## トラブルシューティング

### モジュールが見つからない
```bash
terraform init -upgrade
```

### パス関連エラー
モジュール参照パスが新しい構造に対応しているか確認してください：
- 旧: `source = "./modules/ecs"`
- 新: `source = "./modules/compute/ecs"`

## 関連ドキュメント

- [terraform/README.md](../README.md) - Terraform プロジェクト全体の構成
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - 実装概要
- [../docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - アーキテクチャドキュメント
