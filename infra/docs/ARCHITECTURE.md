# システムアーキテクチャ

## 概要

このAWSプロジェクトは、ECS Fargate上で動作するマイクロサービスアーキテクチャを採用しています。本番環境の高可用性と、開発・ステージング環境のコスト効率を両立させています。

## システム構成図

```
インターネット
    │
  [WAF]
    │
  [ALB - Public Subnet]
    │
  [Next.js - Private Subnet 1]
    │
  [Private ALB]
    │
  [Go Server - Private Subnet 2]
    │
  [RDS Multi-AZ - Private Subnet 3]

[Bastion - Private Subnet 2] ← Session Manager で接続
    ├→ RDS への直接接続
    └→ その他メンテナンス
```

## ネットワーク構成

### サブネット分割

```
VPC: 10.0.0.0/16

Public Subnets:
  - ap-northeast-1a: 10.0.0.0/24  (ALB, Internet Gateway)
  - ap-northeast-1c: 10.0.1.0/24  (ALB, Internet Gateway)

Private Subnets (Application Layer):
  - ap-northeast-1a: 10.0.10.0/24 (Next.js)
  - ap-northeast-1c: 10.0.11.0/24 (Next.js)

Private Subnets (API Layer):
  - ap-northeast-1a: 10.0.20.0/24 (Go Server, Bastion, Private ALB)
  - ap-northeast-1c: 10.0.21.0/24 (Go Server, Bastion, Private ALB)

Private Subnets (Data Layer):
  - ap-northeast-1a: 10.0.30.0/24 (RDS Primary)
  - ap-northeast-1c: 10.0.31.0/24 (RDS Standby)
```

### インターネット接続

- **Public Subnet**: Internet Gateway 経由でインターネット接続
- **Private Subnets**: NAT Gateway （Public Subnet 内）経由のアウトバウンド通信
- **VPC Endpoints**: AWS サービスへのプライベート通信（S3、Secrets Manager、CloudWatch Logs等）

## コンポーネント詳細

### 1. ロードバランサー

#### Public ALB
- **配置**: Public Subnets
- **用途**: インターネットからのトラフィック受け入れ
- **ターゲット**: Next.js ECS タスク（Private Subnet 1）
- **リスナー**: HTTP/HTTPS (80, 443)

#### Private ALB
- **配置**: Private Subnets (API Layer)
- **用途**: Next.js から Go Server へのトラフィック
- **ターゲット**: Go Server ECS タスク
- **リスナー**: HTTP (8080)
- **アクセス制御**: Next.js SG のみ

### 2. コンテナサービス（ECS Fargate）

#### ECS Clusters

複数の環境ごとにクラスタを構成：

- **本番環境**: 高可用性、自動スケーリング有効
- **ステージング環境**: 本番と同一構成、コスト最適化
- **開発環境**: 営業時間のみ稼動（CloudWatch Events + Lambda で自動停止）

#### Next.js タスク定義

```
- CPU: 256 mCU
- メモリ: 512 MB
- イメージソース: ECR (プライベートリポジトリ)
- ルートファイルシステム: 読み取り専用
- ネットワーク: awsvpc モード
- ロギング: CloudWatch Logs (/ecs/nextjs)
- 配置: Private Subnet 1 (Application)
```

#### Go Server タスク定義

```
- CPU: 512 mCU
- メモリ: 1024 MB
- イメージソース: ECR (プライベートリポジトリ)
- ルートファイルシステム: 読み取り専用
- ネットワーク: awsvpc モード
- ロギング: CloudWatch Logs (/ecs/go-server)
- X-Ray Daemon: サイドカー構成（CPU 32, Memory 256）
- 配置: Private Subnet 2 (API)
```

### 3. データベース（RDS）

**マルチAZ構成**

- **エンジン**: MySQL / PostgreSQL（プロジェクト依存）
- **インスタンスタイプ**: db.t3.medium (本番), db.t3.small (開発)
- **配置**: Private Subnet 3 (Data)
- **マルチAZ**: 有効（フェイルオーバー自動）
- **自動バックアップ**: 7日間保持
- **暗号化**: 転送中（TLS 1.2+）、保存時（KMS）
- **モニタリング**: Enhanced Monitoring, CloudWatch Metrics

### 4. ECR（Elastic Container Registry）

**セキュリティ設定**

- **プライベートリポジトリ**: パブリックアクセス禁止
- **イメージスキャン**: CodeBuild で自動スキャン（プッシュ時 + 定期）
- **ライフサイクルポリシー**: 
  - タグ付きイメージ: 最新10個保持
  - 非タグイメージ: 7日後に削除
- **タグの不変性**: IMMUTABLE タグで上書き防止

### 5. ストレージ（S3）

#### Artifact Bucket (`artifact-bucket-{env}`)
- **用途**: CodePipeline アーティファクト保存
- **暗号化**: SSE-KMS（カスタマーマネージド）
- **バージョニング**: 有効
- **アクセス制限**: CodePipeline ロールのみ
- **ライフサイクル**: 30日後に削除

#### Terraform State Bucket (`terraform-state-{env}`)
- **用途**: Terraform 状態ファイル保存
- **暗号化**: SSE-KMS（カスタマーマネージド）
- **バージョニング**: 有効（状態復旧用）
- **MFA Delete**: 有効（本番環境）
- **アクセス制限**: Terraform 実行ロールのみ
- **ログ**: S3 アクセスログ有効化

#### Logs Bucket (`logs-bucket-{env}`)
- **用途**: ALB, WAF, CloudFront ログ保存
- **Intelligent-Tiering**: 有効（自動コスト最適化）
  - Standard: 0-30日
  - Infrequent Access: 30-90日
  - Archive: 90日以上
- **ライフサイクル**: 365日後に削除
- **暗号化**: SSE-KMS
- **バージョニング**: 有効

### 6. セキュリティ

#### セキュリティグループ

**ALB SG (Public)**:
```
Inbound:
  - TCP 80 from 0.0.0.0/0 (HTTP)
  - TCP 443 from 0.0.0.0/0 (HTTPS)

Outbound:
  - TCP 3000 to Next.js SG (Next.js)
```

**Next.js SG (Private Subnet 1)**:
```
Inbound:
  - TCP 3000 from ALB SG

Outbound:
  - TCP 8080 to Go Server SG (Private ALB)
  - TCP 443 to 0.0.0.0/0 (AWS APIs, CloudWatch)
```

**Private ALB SG (Private Subnet 2)**:
```
Inbound:
  - TCP 8080 from Next.js SG

Outbound:
  - TCP 8080 to Go Server SG
```

**Go Server SG (Private Subnet 2)**:
```
Inbound:
  - TCP 8080 from Private ALB SG

Outbound:
  - TCP 3306/5432 to RDS SG (RDS)
  - TCP 443 to 0.0.0.0/0 (AWS APIs, X-Ray)
```

**RDS SG (Private Subnet 3)**:
```
Inbound:
  - TCP 3306/5432 from Go Server SG
  - TCP 3306/5432 from Bastion SG

Outbound:
  - 制限なし（通常は不要）
```

**Bastion SG (Private Subnet 2)**:
```
Inbound:
  - SSM Session Manager のみ（SG ルール不要）

Outbound:
  - TCP 3306/5432 to RDS SG (RDS)
  - TCP 443 to 0.0.0.0/0 (AWS APIs, CloudWatch Logs)
```

#### IAM ロール

**ECS Task Execution Role**:
- ecr:GetAuthorizationToken, ecr:BatchGetImage, ecr:GetDownloadUrlForLayer
- logs:CreateLogStream, logs:PutLogEvents
- secretsmanager:GetSecretValue
- kms:Decrypt

**ECS Task Role (Next.js)**:
- logs:PutLogEvents
- xray:PutTraceSegments, xray:PutTelemetryRecords
- s3:GetObject (static assets)
- cloudwatch:PutMetricData

**ECS Task Role (Go Server)**:
- logs:PutLogEvents
- xray:PutTraceSegments, xray:PutTelemetryRecords
- secretsmanager:GetSecretValue
- rds:DescribeDBInstances
- rds-db:connect (RDS IAM Auth)
- cloudwatch:PutMetricData
- kms:Decrypt

**Lambda Role (ECS 管理用)**:
- ecs:UpdateService, ecs:DescribeServices
- logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents

**Bastion Role**:
- ssm:UpdateInstanceInformation (Session Manager)
- ssmmessages:CreateControlChannel, CreateDataChannel
- ssmmessages:OpenControlChannel, OpenDataChannel
- logs:CreateLogStream, logs:PutLogEvents
- rds:DescribeDBInstances
- rds-db:connect

**CodePipeline/CodeBuild Role**:
- ecr:GetAuthorizationToken, ecr:BatchGetImage, ecr:PutImage
- ecr:InitiateLayerUpload, ecr:UploadLayerPart, ecr:CompleteLayerUpload
- codebuild:BatchGetBuilds
- codedeploy:CreateDeployment
- ecs:UpdateService
- s3:GetObject, s3:PutObject
- logs:CreateLogGroup, logs:CreateLogStream, logs:PutLogEvents

### 7. Bastion ホスト設計

**セッションマネージャーベース（Fargate）**
- **デプロイ方法**: ECS Fargate タスク（EC2 不要）
- **イメージ**: Amazon Linux 2
- **配置**: Private Subnet 2 (API Layer)
- **アクセス方法**: AWS Session Manager（SSH キー、踏み台サーバー不要）
- **自動設定**:
  - IAM ロール: SSM Session Manager 権限を付与
  - CloudWatch Logs エージェント: 全セッション操作ログを記録
  - AWS CLI プリインストール
  - MySQL/PostgreSQL クライアント: User Data で自動インストール
- **用途**: 
  - RDS への直接接続（DB 管理タスク・マイグレーション）
  - VPC 内リソース診断
  - 緊急対応・トラブルシューティング
  - 監査記録: CloudWatch Logs に全操作を自動記録（日時・ユーザー・コマンド・結果）

**ネットワーク**:
- **セキュリティグループ**: Bastion SG
  - Inbound: VPC Endpoint（SSM）から接続
  - Outbound: RDS + AWS APIs へのアクセス許可
- **IAM ロール**:
  - `ssm:UpdateInstanceInformation` - Session Manager 登録
  - `ssmmessages:CreateControlChannel` - セッション確立
  - `logs:CreateLogStream`, `logs:PutLogEvents` - CloudWatch Logs 記録
  - `secretsmanager:GetSecretValue` - DB 認証情報取得
  - `rds-db:connect` - RDS IAM Database Auth 対応

**セキュリティの利点**:
- SSH キー管理が不要
- ネットワーク経由のアクセス記録が CloudWatch Logs に自動保存
- IAM と連携した統一的なアクセス制御
- AWS CloudTrail で API 呼び出しも監査可能

### 8. 監視・ログ設計

**CloudWatch Logs**:
- **ECS ログ**: `/ecs/{app}-{env}` グループ
  - Next.js: `/ecs/nextjs-{env}` (保持: 14日)
  - Go Server: `/ecs/go-server-{env}` (保持: 14日)
  - Bastion: `/ecs/bastion-{env}` (保持: 30日・監査用)
- **RDS ログ**: `rds/{db-instance}/error`, `rds/{db-instance}/slowquery` (保持: 7日)
- **Lambda ログ**: `/aws/lambda/{function-name}` (保持: 3-14日)
- **ログ暗号化**: KMS キーで暗号化（本番環境推奨）

**CloudWatch Container Insights**:
- ECS クラスタ、サービス、タスク レベルのメトリクス可視化
- CPU、メモリ、ネットワーク使用率をリアルタイム監視
- コンテナのパフォーマンス問題を即座に検出

**CloudWatch Alarms**:
- **ECS アラーム**:
  - CPU使用率 > 80% （2回連続）
  - メモリ使用率 > 85% （2回連続）
  - タスク実行失敗率 > 5%
- **RDS アラーム**:
  - CPU使用率 > 80% （2回連続）
  - DB接続数 > 80
  - ストレージ < 10GB （容量警告）
  - DB レプリケーション遅延 > 1秒
- **通知先**: SNS トピック → メール/Slack/PagerDuty

**X-Ray 分散トレース**:
- ECS タスク内に X-Ray Daemon サイドカー配置
- API 呼び出しの遅延箇所を可視化
- データベースクエリの性能分析

**CloudTrail**:
- IAM、RDS、ECS API 呼び出しの監査
- 本番環境で有効推奨（S3 に 90日保存後 Glacier へ移行）

### 9. CI/CD パイプライン

**GitHub Integration**
- リポジトリ: `hogecode/ecs-sample`
- ブランチ戦略: GitFlow (main, develop, feature/*)
- トリガー: GitHub OAuth によるプッシュ検出

**CodeBuild Projects**
- `ecs-sample-{env}-build`: Docker イメージビルド + ECR プッシュ
  - buildspec.yaml 使用
  - Compute Type: 本番=Large, ステージング=Medium
  - キャッシング: Docker レイヤーキャッシュ有効
  
- `ecs-sample-{env}-scan`: Trivy セキュリティスキャン
  - buildspec-scan.yaml 使用
  - CRITICAL 脆弱性で自動失敗
  - 脆弱性ポリシー: CRITICAL/HIGH は対応必須

**CodeDeploy Configuration**
- ECS Fargate Blue/Green デプロイメント
- ステージング: AllAtOnce（全タスク同時更新）
- 本番: Canary（10%→5分待機→90%）
- 自動ロールバック: 有効（失敗時）

**CodePipeline Stages**
1. Source (GitHub) - develop/main ブランチ
2. Build (CodeBuild) - Docker イメージ作成
3. Scan (CodeBuild) - 脆弱性チェック
4. Approval (Manual) - 本番環境のみ
5. Deploy (CodeDeploy) - ECS にデプロイ

**IAM Roles**
- CodeBuild Role: ECR, S3, CloudWatch Logs 権限
- CodePipeline Role: CodeBuild, CodeDeploy, S3, ECS 権限
- CodeDeploy Role: ECS 更新権限

**Artifact Storage**
- S3 Bucket: `artifact-bucket-{env}`
- KMS 暗号化: 有効
- 保持期間: 30日

## トラフィックフロー

### リクエストフロー（インバウンド）

```
1. クライアント → Public ALB (WAF で保護)
2. Public ALB → Next.js ECS (Private Subnet 1)
3. Next.js → Private ALB (内部通信)
4. Private ALB → Go Server ECS (Private Subnet 2)
5. Go Server → RDS (Private Subnet 3)
```

### ログ・メトリクスフロー

```
ECS → CloudWatch Logs (アプリケーションログ)
ECS → Container Insights (リソースメトリクス)
ECS → X-Ray Daemon (分散トレース)
ECS → CloudWatch Metrics (カスタムメトリクス)
CloudWatch Logs → Subscription Filter → Lambda → SNS (アラート)
RDS → CloudWatch Logs (DB ログ)
```

## 環境別構成

### 本番環境

**マルチAZ**:
- 2個の AZ に各リソース配置
- RDS: Multi-AZ フェイルオーバー有効

**ECS**:
- キャパシティプロバイダ: Fargate（安定性重視）
- オートスケーリング: ターゲット追跡型（ターゲット: CPU 70%）
- 最小タスク数: 3（高可用性）
- 最大タスク数: 10（コスト上限）

**ロギング・バックアップ**:
- CloudWatch Logs 保持: 30日
- RDS バックアップ: 7日間
- S3 ライフサイクル: Intelligent-Tiering 有効

### ステージング環境

**AZ**:
- 2個の AZ（本番と同じ）

**ECS**:
- キャパシティプロバイダ: Fargate Spot 80% + Fargate 20%
- オートスケーリング: ターゲット: CPU 75%
- 最小タスク数: 2
- 最大タスク数: 6

**ロギング・バックアップ**:
- CloudWatch Logs 保持: 14日
- RDS バックアップ: 3日間
- 自動停止: なし（常時稼動）

### 開発環境

**AZ**:
- 1個の AZ（コスト最適化）

**ECS**:
- キャパシティプロバイダ: Fargate Spot
- スケジュール停止: 22:00-09:00 JST
- 最小タスク数: 0（停止時）
- 最大タスク数: 3

**ロギング・バックアップ**:
- CloudWatch Logs 保持: 3日
- RDS バックアップ: 手動のみ

## システムメンテナンス

### サービス停止時の手順

1. ALB のリスナールールをメンテナンス画面に切り替え
2. メンテナンス作業実施（DB パッチ等）
3. リスナールールを本来のターゲットに戻す

### ログメンテナンス

- CloudWatch Logs: 自動削除（保持期間設定）
- S3: Intelligent-Tiering + ライフサイクルで自動管理
- ECR: ライフサイクルポリシーで古いイメージ削除

## パフォーマンスと可用性

### 可用性設計

- **RTO**: 本番環境 < 1時間（リージョンフェイルオーバー可能）
- **RPO**: 本番環境 < 15分（RDS 自動バックアップ）
- **SLA**: 99.9% 稼働率（マルチAZ構成）

### パフォーマンス最適化

- ECS オートスケーリング: CPU 追跡型
- RDS: Enhanced Monitoring で詳細メトリクス監視
- CloudWatch Container Insights で可視化
- X-Ray による分散トレース分析

## 次のステップ

詳細な実装については、以下のドキュメントを参照：

- [CI/CDパイプライン](./CI_CD.md) - デプロイメント自動化
- [セキュリティ設計](./SECURITY.md) - セキュリティベストプラクティス
- [運用・監視ガイド](./OPERATIONS.md) - 日常運用
- [コスト管理](./COST_MANAGEMENT.md) - コスト最適化
- [災害復旧](./DISASTER_RECOVERY.md) - DRBC 計画
