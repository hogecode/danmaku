# Bastion EC2 Module

EC2ベースのBastionホストを構築するためのTerraformモジュールです。このモジュールは、プライベートサブネット内のRDS、ECS タスク（Go Server、Next.js）へのアクセスを提供します。

## 概要

Bastion EC2は以下の機能を提供します：

- **AWS Systems Manager Session Manager統合**: SSHキーなしで安全にアクセス
- **IAM ロールベースの認証**: EC2インスタンスプロファイルで認証
- **自動ツールのインストール**: mysql-client、postgresql-client、AWS CLI等を自動インストール
- **CloudWatch ログ統合**: ログの自動収集と保管
- **セキュアな通信**: Security Groupで厳密にアクセス制御

## 使用方法

### 前提条件

1. AWS アカウントへのアクセス権限
2. Terraform がインストール済み
3. VPC、セキュリティグループが既に構築されている

### デプロイ方法

#### 1. Bastionの有効化

`terraform/environments/dev.tfvars`に以下を追加：

```hcl
enable_bastion = true
bastion_instance_type = "t3.micro"  # または t3.small
bastion_root_volume_size = 20       # GB
```

#### 2. Terraformの実行

```bash
cd terraform
terraform plan
terraform apply
```

### Session Manager経由でのアクセス

#### Bastion インスタンスへの接続

```bash
# AWS CLIで接続
aws ssm start-session \
  --target i-xxxxxxxxx \
  --region ap-northeast-1

# または EC2 Instance Connectを使用
aws ec2-instance-connect ssh --instance-id i-xxxxxxxxx --region ap-northeast-1
```

#### RDSへの接続

```bash
# Session Manager経由で接続
aws ssm start-session --target i-xxxxxxxxx

# Bastion内でmysqlクライアントを実行
mysql -h <RDS_ENDPOINT> -P 3306 -u <USERNAME> -p
```

例：
```bash
mysql -h ecs-sample-db-dev.c1234567890.ap-northeast-1.rds.amazonaws.com -P 3306 -u admin -p ecsdb
```

#### Go Server への接続

```bash
# Session Manager経由でBastionに接続
aws ssm start-session --target i-xxxxxxxxx

# Bastionから Go Server にアクセス
curl http://<GO_SERVER_PRIVATE_IP>:8080/health
```

#### Next.js への接続

```bash
# Session Manager経由でBastionに接続
aws ssm start-session --target i-xxxxxxxxx

# Bastionから Next.js にアクセス
curl http://<NEXTJS_PRIVATE_IP>:3000
```

### ポートフォワーディング

```bash
# RDS用のポートフォワーディング
aws ssm start-session \
  --target i-xxxxxxxxx \
  --document-name AWS-StartPortForwardingSession \
  --parameters "localPortNumber=3306,portNumber=3306,host=<RDS_ENDPOINT>"

# その後、ローカルマシンから
mysql -h localhost -P 3306 -u admin -p
```

## インストール済みツール

Bastionインスタンスに自動インストールされるツール：

- **AWS CLI v2**: AWS リソースの操作
- **mysql-client**: MySQL/MariaDB への接続
- **postgresql-client**: PostgreSQL への接続（db_engine = postgres の場合）
- **CloudWatch Agent**: ログ出力の自動化
- **git**: バージョン管理ツール
- **docker**: コンテナ実行
- **curl, wget**: ダウンロードツール
- **vim, nano**: テキストエディタ
- **htop**: プロセス監視
- **jq**: JSON 処理

## セキュリティ

### ネットワーク設定

Bastionセキュリティグループのルール：

| 方向 | プロトコル | ポート | 対象 | 説明 |
|------|----------|--------|------|------|
| イングレス | - | - | - | なし（Session Managerで接続） |
| エグレス | TCP | 3306 | RDS | MySQL アクセス |
| エグレス | TCP | 5432 | RDS | PostgreSQL アクセス |
| エグレス | TCP | 443 | インターネット | AWS API、パッケージ更新 |
| エグレス | TCP | 80 | インターネット | パッケージ更新 |
| エグレス | TCP | 8080 | Go Server | API アクセス |
| エグレス | TCP | 3000 | Next.js | Web アクセス |

### IAM ロール権限

Bastionが持つIAM権限：

- **AmazonSSMManagedInstanceCore**: Systems Manager Session Manager アクセス
- **CloudWatchAgentServerPolicy**: CloudWatch ログ出力
- **Secrets Manager**: RDS マスターパスワード取得（オプション）

## トラブルシューティング

### Session Manager に接続できない

1. IAM ロールが正しく設定されているか確認：
   ```bash
   aws ec2 describe-instances --instance-ids i-xxxxxxxxx --region ap-northeast-1
   ```

2. SSM Agent が実行中か確認：
   - AWS Systems Manager > Session Manager でコンソール接続してチェック

3. セキュリティグループのエグレスルールが正しいか確認

### RDS に接続できない

1. RDS エンドポイントと認証情報を確認
2. Bastion から RDS へのネットワークアクセスを確認：
   ```bash
   telnet <RDS_ENDPOINT> 3306
   ```

3. RDS セキュリティグループが Bastion からのアクセスを許可しているか確認

### ツールが見つからない

ユーザーデータスクリプトが正常に実行されたか確認：

```bash
# Bastionに接続後
tail -f /var/log/bastion-init.log
```

## コスト最適化

### 自動シャットダウン

環境構築時のみ使用する場合、以下を設定：

```bash
# AWS Systemsで自動シャットダウンスケジュール設定
# または手動で停止
aws ec2 stop-instances --instance-ids i-xxxxxxxxx --region ap-northeast-1
```

### 本番環境での使用

本番環境での使用は推奨されません。代わりに以下を検討：

- VPC エンドポイント経由の直接接続
- AWS Secrets Manager 統合
- 定期的なログ監査
- Bastion用の専用セキュリティグループ

## 参考リンク

- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [EC2 Instance Connect](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-connect-prerequisites.html)
- [IAM Roles for EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
