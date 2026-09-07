# セキュリティ設計

## 概要

このドキュメントは、AWSプロジェクトのセキュリティ設計とベストプラクティスについて説明します。IAM、ネットワーク、コンテナ、データ保護など、複数のレイヤーでセキュリティを実装しています。

## セキュリティ階層モデル

```
┌─────────────────────────────────────────┐
│ ① 物理的セキュリティ (AWS 責任)         │
├─────────────────────────────────────────┤
│ ② ネットワークセキュリティ             │
│    - VPC、セキュリティグループ、WAF    │
├─────────────────────────────────────────┤
│ ③ IAM・アクセス管理                    │
│    - ロール、ポリシー、MFA             │
├─────────────────────────────────────────┤
│ ④ コンテナセキュリティ                 │
│    - ECR、イメージスキャン、署名       │
├─────────────────────────────────────────┤
│ ⑤ データ保護                           │
│    - 暗号化、キー管理、監査             │
├─────────────────────────────────────────┤
│ ⑥ ロギング・監視                       │
│    - CloudWatch、GuardDuty、X-Ray      │
└─────────────────────────────────────────┘
```

## ① ネットワークセキュリティ

### VPC アーキテクチャ

```
インターネット
    ↓
   WAF
    ↓
[Public Subnet]
  ├─ ALB
  ├─ NAT Gateway
  └─ Bastion Host (Fargate)
    ↓
[Private Subnet - App]
  ├─ ECS (Next.js)
  └─ Private ALB
    ↓
[Private Subnet - Data]
  ├─ RDS
  ├─ Secrets Manager
  └─ VPC Endpoints
```

### セキュリティグループ

#### インターネット向け ALB
```
Inbound:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0

Outbound:
  - All traffic to ECS SG
```

#### ECS タスク（Next.js）
```
Inbound:
  - Port 3000 from ALB SG

Outbound:
  - Port 3000 to Private ALB SG (Go Server)
  - Port 443 to 0.0.0.0/0 (HTTPS for AWS APIs)
  - All traffic to RDS SG (DB queries)
```

#### ECS タスク（Go Server）
```
Inbound:
  - Port 8080 from Private ALB SG
  - Port 8080 from Next.js SG (internal communication)

Outbound:
  - Port 5432/3306 to RDS SG
  - Port 443 to 0.0.0.0/0 (AWS APIs, X-Ray)
```

#### RDS
```
Inbound:
  - Port 3306 (MySQL) from ECS SG
  - Port 5432 (PostgreSQL) from ECS SG
  - Port 3306/5432 from Bastion SG

Outbound:
  - No restrictions (usually not needed)
```

#### Bastion Host
```
Inbound:
  - All traffic (Session Manager 経由のみ)

Outbound:
  - Port 3306/5432 to RDS SG
  - Port 3000/8080 to ECS SG
  - Port 443 to 0.0.0.0/0 (AWS APIs, logging)
```

### WAF (Web Application Firewall)

**保護ルール**:

1. **AWS Managed Rules**
   - AWSManagedRulesCommonRuleSet: SQL インジェクション、XSS、CSRF
   - AWSManagedRulesKnownBadInputsRuleSet: 既知の悪意あるパターン
   - AWSManagedRulesAmazonIpReputationList: 悪意あるIP

2. **カスタムルール**
   - Rate limiting: 1分あたり2000リクエスト
   - Geo-blocking: 特定国からのアクセス制限（要件に応じて）
   - IP whitelist: 管理者アクセス制限

3. **ロギング**
   - CloudWatch Logs: `/aws/wafv2/ecs-sample`
   - S3: `s3://waf-logs-bucket/`

### VPC エンドポイント

インターネット経由を避けるため、プライベート通信を確保：

| サービス | タイプ | 用途 |
|---------|------|------|
| S3 | Gateway | ログ、アーティファクト |
| DynamoDB | Gateway | キャッシュ（検討中） |
| Secrets Manager | Interface | 秘密情報取得 |
| CloudWatch Logs | Interface | ログ送信 |
| ECR API | Interface | イメージプル |
| ECR DKR | Interface | イメージプル |
| CloudWatch | Interface | メトリクス送信 |
| X-Ray | Interface | トレース送信 |
| SNS | Interface | アラート通知 |

### NAT Gateway

- **配置**: パブリックサブネット（各 AZ）
- **用途**: プライベートサブネットからのアウトバウンド通信
- **コスト最適化**: 開発環境は不要（VPC Endpoint 使用）

## ② IAM・アクセス管理

### IAM ロール設計

#### ECS Task Execution Role
```
ロール: ecsTaskExecutionRole

権限:
  - ecr:GetAuthorizationToken
  - ecr:BatchGetImage
  - ecr:GetDownloadUrlForLayer
  - logs:CreateLogStream
  - logs:PutLogEvents
  - secretsmanager:GetSecretValue (環境変数用)
  - kms:Decrypt (暗号化シークレット用)
```

#### ECS Task Role (Next.js)
```
ロール: ecsTaskRoleNextjs

権限:
  - logs:CreateLogStream
  - logs:PutLogEvents
  - xray:PutTraceSegments
  - xray:PutTelemetryRecords
  - secretsmanager:GetSecretValue (runtime secrets)
  - s3:GetObject (static assets)
  - cloudwatch:PutMetricData
```

#### ECS Task Role (Go Server)
```
ロール: ecsTaskRoleGoServer

権限:
  - logs:CreateLogStream
  - logs:PutLogEvents
  - xray:PutTraceSegments
  - xray:PutTelemetryRecords
  - secretsmanager:GetSecretValue
  - rds:DescribeDBInstances
  - rds-db:connect (RDS IAM Database Auth)
  - cloudwatch:PutMetricData
  - kms:Decrypt
```

#### Lambda Role (CloudWatch Events 用)
```
ロール: lambdaEcsManagementRole

権限:
  - ecs:UpdateService (タスク数更新)
  - ecs:DescribeServices
  - logs:CreateLogGroup
  - logs:CreateLogStream
  - logs:PutLogEvents
```

#### Bastion Host Role
```
ロール: bastionHostRole

権限:
  - logs:CreateLogStream
  - logs:PutLogEvents
  - logs:DescribeLogStreams
  - ssm:UpdateInstanceInformation (Session Manager)
  - ssmmessages:CreateControlChannel
  - ssmmessages:CreateDataChannel
  - ssmmessages:OpenControlChannel
  - ssmmessages:OpenDataChannel
  - rds:DescribeDBInstances
  - rds-db:connect
```

#### CodePipeline/CodeBuild Role
```
ロール: codePipelineServiceRole

権限:
  - codecommit:GetBranch (ソース)
  - codebuild:BatchGetBuilds
  - codebuild:BatchBuildIdentifiers
  - codedeploy:CreateDeployment
  - codedeploy:GetApplication
  - codedeploy:GetDeploymentGroup
  - ecs:UpdateService
  - iam:PassRole
  - s3:GetObject
  - s3:PutObject
```

### MFA (多要素認証)

- **本番環境へのアクセス**: MFA 必須
- **Bastion Host**: Session Manager 使用（キー不要）
- **IAM ユーザー**: 管理者は MFA 有効化

### アクセスキー管理

```
ローテーション周期: 90日
未使用キー削除: 180日以上未使用の場合
Secrets Manager: すべてのキーを登録
```

## ③ コンテナセキュリティ

### ECR セキュリティ設定

#### リポジトリポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole"
      },
      "Action": [
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ]
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/CodeBuildRole"
      },
      "Action": [
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ]
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:SourceVpc": "vpc-xxxxx"
        }
      }
    }
  ]
}
```

#### イメージタグの不変性

```
設定: IMMUTABLE
効果: タグの上書きを防止
     リリースされたイメージの改ざん防止
```

#### イメージスキャン設定

**自動スキャン**
- トリガー: イメージプッシュ時
- スキャナ: ECR ネイティブスキャナ or Trivy

**手動スキャン（定期実行）**
- スケジュール: 毎日 02:00 UTC
- 実行方法: CloudWatch Events → Lambda → CodeBuild

**脆弱性重要度別対応**

| 重要度 | CVSS | 対応 | SLA |
|------|------|------|-----|
| CRITICAL | 9.0-10.0 | 即座にパッチ | 24h |
| HIGH | 7.0-8.9 | パッチ適用 | 1週間 |
| MEDIUM | 4.0-6.9 | 定期パッチ | 2週間 |
| LOW | 0-3.9 | 記録のみ | なし |

#### ライフサイクルポリシー

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Delete untagged images older than 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

### コンテナイメージセキュリティ

#### Dockle によるイメージチェック

**チェック項目**:
- root ユーザー実行の回避
- 定期更新タグの使用（:latest 推奨）
- 不要なパッケージの除去
- 非root ユーザーの設定

**実行方法**:
```bash
# GitHub Actions で実行
dockle --exit-code 1 <image>
```

#### マルチステージビルド

```dockerfile
# Stage 1: Build
FROM golang:1.19 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app

# Stage 2: Runtime
FROM alpine:3.17
RUN adduser -D appuser
COPY --from=builder /app/app /app
USER appuser
ENTRYPOINT ["/app"]
```

### ECS タスク定義セキュリティ

#### ルートファイルシステムの読み取り専用化

```json
{
  "family": "ecs-sample-nextjs",
  "containerDefinitions": [
    {
      "name": "nextjs",
      "readonlyRootFilesystem": true,
      "volumesFrom": [],
      "mountPoints": [
        {
          "sourceVolume": "tmp",
          "containerPath": "/tmp",
          "readOnly": false
        }
      ]
    }
  ],
  "volumes": [
    {
      "name": "tmp",
      "host": {
        "sourcePath": "/tmp"
      }
    }
  ]
}
```

#### リソース制限

```json
{
  "cpu": "256",
  "memory": "512",
  "privileged": false,
  "essential": true,
  "stopTimeout": 30
}
```

### X-Ray Daemon (サイドカー構成)

```json
{
  "name": "xray-daemon",
  "image": "public.ecr.aws/xray/aws-xray-daemon:latest",
  "cpu": 32,
  "memory": 256,
  "portMappings": [
    {
      "containerPort": 2000,
      "protocol": "udp"
    }
  ],
  "logConfiguration": {
    "logDriver": "awslogs",
    "options": {
      "awslogs-group": "/ecs/xray-daemon",
      "awslogs-region": "ap-northeast-1",
      "awslogs-stream-prefix": "ecs"
    }
  }
}
```

## ④ データ保護

### Secrets Manager 統合

**保存する秘密情報**:
- RDS: ユーザー名、パスワード、エンドポイント
- API キー: 外部サービス連携用
- JWT キー: 署名・検証用キー

**タスク定義での利用**:
```json
{
  "secrets": [
    {
      "name": "DB_PASSWORD",
      "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:rds/password"
    },
    {
      "name": "API_KEY",
      "valueFrom": "arn:aws:secretsmanager:ap-northeast-1:123456789012:secret:external/api-key"
    }
  ]
}
```

**ローテーション設定**:
```
頻度: 30日
自動実行: Lambda function
変更対象: 非本番環境は随時、本番環境は営業時間外
```

### RDS 暗号化

#### 転送中の暗号化
```
プロトコル: TLS 1.2+
設定: require を設定
```

#### 保存時の暗号化
```
KMS キー: カスタマーマネージドキー
自動ローテーション: 有効
アクセス権限: IAM ロールベース
```

#### RDS IAM Database Authentication

```bash
# トークン生成
TOKEN=$(aws rds generate-db-auth-token \
  --hostname mydb.xxxxxx.ap-northeast-1.rds.amazonaws.com \
  --port 3306 \
  --region ap-northeast-1 \
  --username admin)

# 接続
mysql -h mydb.xxxxxx.ap-northeast-1.rds.amazonaws.com \
  --port=3306 \
  --ssl-mode=REQUIRED \
  --enable-cleartext-plugin \
  -u admin \
  -p$TOKEN
```

### S3 暗号化

#### デフォルト暗号化
```
アルゴリズム: AES-256 (SSE-S3) または SSE-KMS
KMS キー: カスタマーマネージド
```

#### バージョニング
```
設定: 有効
目的: 誤削除防止、監査証跡
```

#### アクセス制限
```
パブリックアクセス: すべてブロック
バケットポリシー: 特定 IAM ロールのみ
```

## ⑤ ロギング・監視・監査

### CloudWatch Logs

#### ログストリーム構成

```
/ecs/nextjs/
  ├── prod-nextjs-001
  ├── prod-nextjs-002
  └── prod-nextjs-003

/ecs/go-server/
  ├── prod-go-001
  ├── prod-go-002
  └── prod-go-003

/xray/daemon/
  └── prod-xray

/bastion/session/
  └── session-manager-logs
```

#### ログ保持期間

| 環境 | 保持期間 | 理由 |
|------|--------|------|
| 本番 | 30日 | コンプライアンス |
| ステージング | 14日 | テスト検証 |
| 開発 | 3日 | コスト削減 |

### CloudWatch Logs Subscription Filter

**用途**: 特定のエラーパターンを検出して SNS 通知

```json
{
  "filterName": "ErrorPattern",
  "filterPattern": "[ERROR]",
  "logGroupName": "/ecs/go-server",
  "destinationArn": "arn:aws:lambda:ap-northeast-1:123456789012:function:ProcessErrorLog"
}
```

**Lambda Function**:
```python
def lambda_handler(event, context):
    # CloudWatch Logs からデータ解凍
    log_data = json.loads(gzip.decompress(
        base64.b64decode(event['awslogs']['data'])
    ))
    
    # エラーカウント確認
    critical_count = len([
        log for log in log_data['logEvents']
        if 'CRITICAL' in log['message']
    ])
    
    # 通知送信
    if critical_count > 0:
        sns.publish(
            TopicArn='arn:aws:sns:ap-northeast-1:123456789012:alerts',
            Subject=f'Critical Errors: {critical_count}',
            Message=json.dumps(log_data)
        )
```

### GuardDuty

**監視対象**:
- VPC Flow Logs: ネットワーク異常検出
- CloudTrail: API 呼び出し異常
- DNS logs: 悪意あるドメインアクセス

**アラート設定**:
```
通知先: SNS トピック
自動修復: Security Group ルール自動更新（検討中）
```

### VPC Flow Logs

**配置**: ALB と ECS サブネット
**記録**: 受け入れ・拒否されたすべての通信
**保存**: CloudWatch Logs + S3

```
ログ形式:
  version account-id interface-id srcaddr dstaddr srcport dstport
  protocol packets bytes start end action log-status
```

## ⑥ 脅威検知・対応

### GuardDuty 脅威タイプ別対応

| 脅威タイプ | 検知方法 | 対応 | SLA |
|-----------|--------|------|-----|
| EC2/ECS 侵害 | 異常な EC2 動作 | インスタンス停止 | 1h |
| 認証情報盗難 | IAM 権限異常 | キー無効化 | 30min |
| S3 バケット侵害 | 異常な API 呼び出し | アクセス制限 | 1h |
| ネットワーク侵害 | 異常な通信パターン | SG 更新 | 1h |

## セキュリティ監査チェックリスト

### 週次チェック
- [ ] CloudWatch Alarms に未解決がないか
- [ ] ログイン失敗がないか
- [ ] GuardDuty の新しい所見を確認

### 月次チェック
- [ ] IAM アクセスキー使用状況確認
- [ ] ECR イメージスキャン結果確認
- [ ] Security Hub の所見確認
- [ ] 不要な IAM ユーザー削除

### 四半期チェック
- [ ] ネットワーク ACL 定期見直し
- [ ] IAM ポリシー権限見直し
- [ ] 暗号化キー ローテーション
- [ ] Secrets Manager パスワード ローテーション

### 年次チェック
- [ ] セキュリティアーキテクチャ見直し
- [ ] ペネトレーション テスト実施
- [ ] コンプライアンス監査
- [ ] 災害復旧訓練

## インシデント対応

### インシデント分類

| レベル | 例 | 対応時間 | エスカレーション |
|------|-----|--------|-----------------|
| CRITICAL | 本番データ流出、認証回避 | 即座 | CTO, CFO |
| HIGH | 一部データ漏洩、サービス停止 | 1時間 | CTO, 部長 |
| MEDIUM | 脆弱性発見、ログ異常 | 4時間 | 担当リーダー |
| LOW | ログ件数増加 | 24時間 | チーム内報告 |

### インシデント対応流れ

1. **検知**: GuardDuty/CloudWatch Alert
2. **初期対応**: ログ保存、影響範囲確認
3. **隔離**: リソース停止、アクセス制限
4. **調査**: ログ分析、侵害範囲特定
5. **復旧**: バックアップ復元、パッチ適用
6. **報告**: インシデント報告、改善提案

## セキュリティベストプラクティス

1. **最小権限の原則**: 必要最小限の権限のみ付与
2. **多層防御**: 複数の防御レイヤーを実装
3. **定期更新**: コンテナイメージ、ライブラリの定期更新
4. **暗号化**: 転送中・保存時の両方を暗号化
5. **監査**: すべてのアクティビティをログ記録
6. **検証**: 定期的なセキュリティ監査、ペネテスト
7. **教育**: チーム全員のセキュリティ意識向上

## 参考資料

- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon-web-services)
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
