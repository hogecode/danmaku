# Terraform IaC - AWS ECS Architecture

このディレクトリは、`docs/ARCHITECTURE.md` に記載されたAWSアーキテクチャをTerraformで実装するコードベースです。AWS公式モジュール（`terraform-aws-modules`）を活用した、段階的な実装アプローチを採用しています。

## 📁 ディレクトリ構造

```
terraform/
├── provider.tf                 # AWS Provider 設定
├── variables.tf                # 環境共通の変数定義
├── outputs.tf                  # ルートモジュールの出力
├── locals.tf                   # ローカル値・計算ロジック
├── main.tf                     # ルートモジュール設定
│
├── dev.tfvars                  # 開発環境変数
├── staging.tfvars              # ステージング環境変数
├── prod.tfvars                 # 本番環境変数
│
├── .gitignore                  # Git 除外設定
├── README.md                   # このファイル
│
└── modules/                    # 機能別モジュール
    ├── vpc/                    # VPC・ネットワーク
    │   ├── main.tf            # terraform-aws-modules/vpc + 追加設定
    │   ├── variables.tf        # モジュール入力変数
    │   └── outputs.tf          # モジュール出力
    │
    └── security_group/         # セキュリティグループ
        ├── main.tf            # SG リソース定義
        ├── variables.tf        # 入力変数
        └── outputs.tf          # 出力値
```

## 🚀 クイックスタート

### 前提条件

- Terraform >= 1.3
- AWS CLI configured with appropriate credentials
- AWS アカウントと権限

### インストール & 初期化

```bash
# Terraform ディレクトリに移動
cd terraform

# Terraform を初期化（モジュール・プロバイダーをダウンロード）
terraform init
```

### 開発環境への デプロイ

```bash
# デプロイ前に確認
terraform plan -var-file="dev.tfvars"

# デプロイ実行
terraform apply -var-file="dev.tfvars"

# または auto-approve で自動確認
terraform apply -var-file="dev.tfvars" -auto-approve
```

### ステージング環境への デプロイ

```bash
terraform plan -var-file="staging.tfvars"
terraform apply -var-file="staging.tfvars"
```

### 本番環境への デプロイ

```bash
# 本番環境は常に手動確認
terraform plan -var-file="prod.tfvars"

# 確認後に適用（auto-approve は使用しない）
terraform apply -var-file="prod.tfvars"
```

## 📋 実装段階（Phases）

### ✅ Phase 1: ネットワーク基盤 (完了)

**モジュール**: `modules/vpc/`

**実装内容**:
- VPC（10.0.0.0/16）
- Public Subnets（ALB用）
- Private Subnets（3層構成：App、API、DB）
- Internet Gateway
- NAT Gateway（環境別に数は変動）
- VPC Flow Logs（本番・ステージング）
- VPC Endpoints（S3、DynamoDB、Secrets Manager、ECR、CloudWatch等）

**出力値**:
- `vpc_id`, `vpc_cidr`
- Subnet IDs（public, private_app, private_api, private_db）
- NAT Gateway IDs & Public IPs
- VPC Endpoint IDs

---

### ✅ Phase 2: セキュリティ & IAM (進行中)

**モジュール**: `modules/security_group/`

**実装内容**:
- Security Groups（6種類）
  - Public ALB SG
  - Next.js ECS SG
  - Private ALB SG
  - Go Server ECS SG
  - RDS SG
  - Bastion SG
- セキュリティグループルール（インバウンド・アウトバウンド）

**出力値**:
- 各 Security Group IDs

**次のステップ**:
- IAM ロール・ポリシー（ECS Execution Role、Task Role等）
- KMS キー（S3、RDS暗号化用）

---

### ⏳ Phase 3: ロードバランサー (予定)

**モジュール**: `modules/alb/` （未作成）

**実装予定**:
- Public ALB（Application Load Balancer）
  - Listeners: HTTP/HTTPS (80, 443)
  - Target Group: Next.js ECS tasks
- Private ALB（Internal ALB）
  - Listener: HTTP (8080)
  - Target Group: Go Server ECS tasks

**依存関係**: Phase 1, 2

---

### ⏳ Phase 4: ECS (予定)

**モジュール**: `modules/ecs/` （未作成）

**実装予定**:
- ECS Cluster
- ECR Repositories（Next.js、Go Server）
- Task Definitions
  - Next.js（CPU 256, Memory 512 MB）
  - Go Server（CPU 512, Memory 1024 MB + X-Ray Daemon）
- ECS Services（Next.js、Go Server）
- Auto Scaling Groups（ターゲット追跡型）

**依存関係**: Phase 1, 2, 3

---

### ⏳ Phase 5: Database (予定)

**モジュール**: `modules/rds/` （未作成）

**実装予定**:
- RDS DB Subnet Group
- RDS Parameter Group
- RDS Option Group
- RDS Instance（MySQL or PostgreSQL）
  - Multi-AZ（本番環境）
  - Encryption at rest (KMS)
  - Backup & Restore設定

**依存関係**: Phase 1, 2

---

### ⏳ Phase 6: ストレージ & その他 (予定)

**モジュール**: `modules/s3/`, `modules/cloudwatch/` 等（未作成）

**実装予定**:
- S3 Buckets
  - Artifact Bucket（CodePipeline用）
  - Logs Bucket（ALB/WAF ログ）
  - Terraform State Bucket（バックエンド）
- CloudWatch
  - Log Groups（ECS、RDS、WAF等）
  - Dashboards
  - Alarms
- WAF (Optional)
- Bastion Host（ECS Fargate）

**依存関係**: Phase 1, 2, 3

---

## 🔧 環境変数ファイル（*.tfvars）

各環境に応じた変数オーバーライドが可能です：

### dev.tfvars（開発環境）
- Single AZ（コスト最適化）
- NAT Gateway: 1個
- ECS desired count: 1
- RDS: db.t3.small, Single-AZ
- VPC Flow Logs: 無効
- Logs retention: 3日

### staging.tfvars（ステージング環境）
- Multi AZ（本番検証）
- NAT Gateway: 2個
- ECS desired count: 2
- RDS: db.t3.small, Single-AZ（コスト最適化）
- VPC Flow Logs: 無効
- Logs retention: 14日

### prod.tfvars（本番環境）
- Multi AZ（高可用性）
- NAT Gateway: 2個
- ECS desired count: 3
- RDS: db.t3.medium, Multi-AZ
- VPC Flow Logs: 有効（セキュリティ監視）
- Logs retention: 30日

---

## 📊 状態管理（Terraform State）

### ローカル状態（開発時）

```bash
# デフォルトではローカルの terraform.tfstate に保存
terraform apply -var-file="dev.tfvars"
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

## 🔐 セキュリティベストプラクティス

### 機密情報の管理

**機密変数（RDS password等）の安全な受け渡し**:

```bash
# 方法 1: 環境変数で指定
export TF_VAR_rds_password="your-secure-password"
terraform apply -var-file="prod.tfvars"

# 方法 2: AWS Secrets Manager から取得
aws secretsmanager get-secret-value --secret-id rds-password \
  --query SecretString --output text | \
  terraform apply -var-file="prod.tfvars" -var="rds_password=..."

# 方法 3: .tfvars ファイルに記載（Git Ignore で除外）
# ⚠️ 絶対に Git にコミットしないこと
```

### 状態ファイルの保護

- S3 バックエンド設定で `encrypt = true`
- DynamoDB Lock で同時更新を防止
- S3 バージョニング有効化
- MFA Delete の有効化（本番環境）

---

## 🧪 テスト & 検証

### Terraform Validate

```bash
terraform validate
```

### Terraform Format チェック

```bash
terraform fmt -check -recursive
```

### Plan ファイルの生成 & 保存

```bash
# Plan ファイルを生成
terraform plan -var-file="staging.tfvars" -out=tfplan

# 生成された Plan を確認
terraform show tfplan

# Plan を適用
terraform apply tfplan
```

---

## 📚 モジュール詳細

### VPC モジュール（`modules/vpc/`）

**特徴**:
- `terraform-aws-modules/vpc/aws` を使用
- 3層のプライベートサブネット（App、API、DB）
- VPC Endpoints で NAT Gateway コスト削減
- オプション: VPC Flow Logs

**入力変数**:
```hcl
- project_name
- environment
- vpc_cidr
- availability_zones
- public_subnet_cidrs
- private_app_subnet_cidrs
- private_api_subnet_cidrs
- private_db_subnet_cidrs
- enable_nat_gateway
- nat_gateway_count
- enable_vpc_flow_logs
```

**出力値**:
```hcl
- vpc_id, vpc_cidr
- public_subnets, private_app_subnets, private_api_subnets, private_db_subnets
- nat_gateway_ids, nat_gateway_public_ips
- internet_gateway_id
- vpc_endpoints（S3, DynamoDB, Secrets Manager, ECR, CloudWatch等）
```

---

### Security Group モジュール（`modules/security_group/`）

**特徴**:
- 6つのセキュリティグループを定義
- インバウンド・アウトバウンドルールを明確に設定
- セキュリティグループ間の相互参照

**セキュリティグループ一覧**:
1. **ALB Public SG**: 80/443（インターネット）→ 3000（Next.js）
2. **Next.js SG**: 3000（ALB）→ 8080（Private ALB）、443（AWS APIs）
3. **Private ALB SG**: 8080（Next.js）→ 8080（Go Server）
4. **Go Server SG**: 8080（Private ALB）→ 3306/5432（RDS）、443（AWS APIs）
5. **RDS SG**: 3306/5432（Go Server、Bastion）← インバウンドのみ
6. **Bastion SG**: RDS/CloudWatch へのアウトバウンドのみ

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
- `ec2:*`（VPC、Subnet、SG等）
- `elasticloadbalancing:*`（ALB）
- `ecs:*`（ECS Cluster、Service）
- `rds:*`（RDS）
- `s3:*`（S3 buckets）
- `logs:*`（CloudWatch Logs）
- `kms:*`（KMS keys）
- `iam:*`（IAM roles）

---

## 📖 参考資料

- [Terraform AWS Modules](https://registry.terraform.io/modules/terraform-aws-modules/)
- [Terraform AWS VPC Module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)

---

## 🤝 次のステップ

1. **Phase 3（ALB）の実装**: `modules/alb/` を追加
2. **Phase 4（ECS）の実装**: `modules/ecs/` を追加
3. **Phase 5（RDS）の実装**: `modules/rds/` を追加
4. **Phase 6（S3/CloudWatch）の実装**: `modules/s3/`, `modules/cloudwatch/` を追加
5. **CI/CD パイプライン**: GitHub Actions で Terraform を自動化

---

## 📝 ドキュメント更新履歴

| 日付 | 変更内容 |
|-----|--------|
| 2026-04-20 | 初版作成：Phase 1-2 実装完了 |

---

**最終更新**: 2026-04-20

**質問・サポート**: docs/ 内の各ドキュメントを参照してください。
