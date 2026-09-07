# 運用・監視ガイド

## 概要

このドキュメントは、本番環境の運用、スケーリング、トラブルシューティング、監視について説明します。

## 日次運用チェックリスト

### 朝（営業開始時）

```
□ ダッシュボード確認
  - CloudWatch メインダッシュボード
  - ECS クラスタ状態（タスク数、CPU/メモリ）
  - RDS ステータス
  - ALB ターゲット正常性

□ アラート確認
  - CloudWatch Alarms (ALARM ステート)
  - GuardDuty の新しい所見
  - CloudTrail（異常なAPI呼び出し）

□ ログ確認
  - エラーログ（/ecs/go-server）
  - 4xx/5xx エラー率
  - DB 接続エラー

□ パフォーマンス確認
  - レスポンスタイム（p95, p99）
  - スループット (RPS)
  - キューの深さ
```

### 夜（営業終了時）

```
□ リソース利用状況確認
  - ECS CPU/メモリ最大使用率
  - RDS DB Load
  - Network I/O

□ コスト確認
  - 本日の概算コスト
  - NAT Gateway トラフィック量

□ 自動停止確認（開発環境）
  - CloudWatch Events が正常に動作
  - Lambda が ECS タスク停止を実行
```

## 監視・ダッシュボード

### CloudWatch メインダッシュボード構成

**ダッシュボード名**: `ecs-sample-production`

**セクション 1: リソース利用状況**
```
- ECS CPU 使用率（合計、最大、最小）
- ECS メモリ使用率（合計、最大、最小）
- RDS CPU 使用率
- RDS DB Connections
- Network In/Out（ALB）
```

**セクション 2: アプリケーションメトリクス**
```
- HTTPステータスコード分布（2xx, 3xx, 4xx, 5xx）
- ALB レスポンスタイム（p50, p90, p99）
- ECS タスク数（実行中、保留中）
- ECS タスク起動失敗数
```

**セクション 3: データベース**
```
- RDS の読み取り/書き込みレイテンシ
- RDS ストレージ使用量
- RDS のアクティブな接続数
- RDS クエリ実行時間（CloudWatch Insights）
```

**セクション 4: ロギング・トレース**
```
- ログイベント数（レベル別）
- X-Ray トレース数
- エラーログ集計
- 特定キーワードマッチ数（Subscription Filter）
```

### CloudWatch Logs Insights クエリ例

**エラー発生時間帯の特定**
```
fields @timestamp, @message, level
| filter level like /ERROR|CRITICAL/
| stats count() by bin(5m)
```

**遅いクエリの検出**
```
fields @duration, @message, query
| filter @duration > 1000
| stats count(), avg(@duration), max(@duration) by query
| sort max(@duration) desc
```

**HTTP ステータスコード分布**
```
fields status_code
| stats count() as count by status_code
| sort count desc
```

**N分以内のエラー数**
```
fields @timestamp
| filter level like /ERROR/
| stats count() as error_count
| filter error_count > 10
```

## オートスケーリング

### ECS オートスケーリング設定

**ポリシー**: ターゲット追跡型スケーリング

#### 本番環境

```
対象メトリクス: ECSServiceAverageCPUUtilization
ターゲット値: 70%
スケールアップ冷却: 60秒
スケールダウン冷却: 300秒
最小タスク数: 3
最大タスク数: 10
```

**スケーリングロジック**:
```
CPU使用率 >= 70% → タスク追加
CPU使用率 < 50% → タスク削除（段階的）
```

#### ステージング環境

```
対象メトリクス: ECSServiceAverageCPUUtilization
ターゲット値: 75%
スケールアップ冷却: 60秒
スケールダウン冷却: 300秒
最小タスク数: 2
最大タスク数: 6
```

#### 開発環境

```
自動スケーリング: 無効
手動制御: CloudWatch Events + Lambda
スケジュール:
  - 09:00 JST: タスク数 2 に起動
  - 22:00 JST: タスク数 0 に停止
```

### スケーリング実行時の確認事項

1. **スケールアップ時**
   - 新しいタスクが正常に起動したか
   - ログエラーが発生していないか
   - RDS コネクション数が増加したか（予期した範囲内か）

2. **スケールダウン時**
   - 既存タスクがグレースフルシャットダウンしたか
   - ELB から削除されたか
   - キューイングされたリクエストが失われていないか

## 手動スケーリング

### タスク数の手動更新

**コマンド例**:
```bash
# 現在の状態確認
aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query 'services[0].[desiredCount,runningCount,pendingCount]' \
  --output table

# タスク数を5に更新
aws ecs update-service \
  --cluster ecs-sample-prod \
  --service ecs-sample-service \
  --desired-count 5

# 更新状況確認
aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query 'services[0].deployments' \
  --output table
```

## トラブルシューティング

### ECS タスク起動失敗

**症状**: タスクが STOPPED ステートで停止

**確認手順**:

1. **タスク詳細確認**
```bash
aws ecs describe-tasks \
  --cluster ecs-sample-prod \
  --tasks <task-arn> \
  --query 'tasks[0].{
    taskArn: taskArn,
    lastStatus: lastStatus,
    stoppedCode: stoppedCode,
    stoppedReason: stoppedReason,
    containers: containers[0].{
      reason: reason,
      exitCode: exitCode
    }
  }' \
  --output json
```

2. **ログ確認**
```bash
aws logs tail /ecs/go-server --follow --filter-pattern "ERROR"
```

3. **タスク定義確認**
```bash
aws ecs describe-task-definition \
  --task-definition ecs-sample-go:1 \
  --query 'taskDefinition.containerDefinitions[0]' \
  --output json
```

**よくある原因と対応**:

| 原因 | スタッピコード | 対応 |
|------|-------------|------|
| ECR イメージ取得失敗 | CannotPullContainerImage | ECR リポジトリポリシー確認、IAM ロール確認 |
| ホストメモリ不足 | OutOfMemory | タスク定義のメモリを削減、ホスト容量確認 |
| セキュリティグループ設定 | - | SG ルール確認、NACLs 確認 |
| ポート競合 | - | ホスト上で使用中のポート確認 |
| タスク定義エラー | InvalidParameterException | 構文、権限を確認 |

### RDS 接続エラー

**症状**: "Unable to connect to database"

**確認手順**:

1. **RDS ステータス確認**
```bash
aws rds describe-db-instances \
  --db-instance-identifier mydb \
  --query 'DBInstances[0].{
    DBInstanceStatus: DBInstanceStatus,
    Endpoint: Endpoint.Address,
    Engine: Engine,
    AllocatedStorage: AllocatedStorage
  }' \
  --output table
```

2. **セキュリティグループ確認**
```bash
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --query 'SecurityGroups[0].IpPermissions' \
  --output table
```

3. **接続テスト（Bastion から）**
```bash
# Bastion に接続
aws ssm start-session --target i-xxxxxx

# DB 接続テスト
mysql -h mydb.xxxxx.rds.amazonaws.com -u admin -p
```

**よくある原因と対応**:

| 原因 | 確認コマンド | 対応 |
|------|----------|------|
| SG ルール | describe-security-groups | ECS SG から RDS SG への 3306 許可 |
| RDS ダウン | describe-db-instances | RDS 再起動、容量確認 |
| 接続プール満杯 | CloudWatch Connections | アプリコードでコネクション削減 |
| DNS 解決失敗 | nslookup <endpoint> | Route53 / VPC DNS 設定確認 |

### ALB ターゲット異常

**症状**: "Unhealthy" ターゲット

**確認手順**:

1. **ターゲットグループ状態確認**
```bash
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:... \
  --query 'TargetHealthDescriptions[*].{
    Target: Target.Id,
    State: TargetHealth.State,
    Reason: TargetHealth.Reason,
    Description: TargetHealth.Description
  }' \
  --output table
```

2. **ヘルスチェック設定確認**
```bash
aws elbv2 describe-target-groups \
  --target-group-arns arn:aws:elasticloadbalancing:... \
  --query 'TargetGroups[0].{
    HealthCheckPath: HealthCheckPath,
    HealthCheckPort: HealthCheckPort,
    HealthCheckProtocol: HealthCheckProtocol,
    HealthyThresholdCount: HealthyThresholdCount,
    UnhealthyThresholdCount: UnhealthyThresholdCount,
    HealthCheckIntervalSeconds: HealthCheckIntervalSeconds,
    HealthCheckTimeoutSeconds: HealthCheckTimeoutSeconds
  }' \
  --output table
```

3. **タスク内でヘルスチェック実行**
```bash
# Bastion から ECS タスク内のヘルスチェック実行
curl -v http://<task-ip>:3000/health
```

**よくある原因と対応**:

| 原因 | 対応 |
|------|------|
| ヘルスチェック失敗 | アプリログ確認、ポート確認 |
| タスク起動中 | 新デプロイ時は時間待ち |
| メモリ不足 | メモリ削減、タスク数調整 |
| セキュリティグループ | ALB → ECS SG の通信許可確認 |

## デプロイメント実行

### 本番デプロイメントの手順

1. **デプロイ前チェック**
```bash
# 本番環境の現在状態確認
aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query 'services[0].{
    taskDefinition: taskDefinition,
    runningCount: runningCount,
    desiredCount: desiredCount,
    pendingCount: pendingCount,
    deployments: deployments
  }' \
  --output table

# 最新のイメージを確認
aws ecr describe-images \
  --repository-name ecs-sample \
  --query 'imageDetails[0].[imagePushedAt,imageSizeInBytes,imageTags]' \
  --output table
```

2. **デプロイメント実行**
   - GitHub で main ブランチにタグプッシュ
   - CodePipeline が自動開始
   - CodeBuild でビルド・ECR にプッシュ
   - CodeDeploy でステージング環境テスト
   - マニュアル承認後、本番環境にCanary デプロイ

3. **デプロイ中の監視**
```bash
# リアルタイム監視
watch -n 5 'aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query "services[0].deployments" \
  --output table'

# ログ確認
aws logs tail /ecs/go-server --follow
```

4. **デプロイ完了確認**
```bash
# 全タスク正常起動確認
aws ecs describe-tasks \
  --cluster ecs-sample-prod \
  --tasks $(aws ecs list-tasks \
    --cluster ecs-sample-prod \
    --service-name ecs-sample-service \
    --query 'taskArns' \
    --output text) \
  --query 'tasks[*].[taskArn,lastStatus,desiredStatus]' \
  --output table

# ALB ターゲット健全性確認
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn> \
  --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State]' \
  --output table
```

## ロールバック手順

### ECS サービスのロールバック

**状況**: 最新デプロイ後にエラーが発生

```bash
# 1. 前のタスク定義番号を確認
aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query 'services[0].deployments[].taskDefinition' \
  --output text

# 2. 前のタスク定義に切り替え
aws ecs update-service \
  --cluster ecs-sample-prod \
  --service ecs-sample-service \
  --task-definition ecs-sample-go:10  # 前バージョン

# 3. 状態監視
aws logs tail /ecs/go-server --follow --filter-pattern "ERROR"

# 4. 完了確認
aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query 'services[0].{runningCount, desiredCount}' \
  --output table
```

### CodeDeploy による自動ロールバック

CodeDeploy では以下の場合に自動ロールバック:
- CloudWatch Alarm が ALARM 状態
- ターゲット 50% 以上が Unhealthy
- デプロイ失敗

**確認**:
```bash
aws deploy describe-deployment \
  --deployment-id <deployment-id> \
  --query 'deploymentInfo.{
    status: status,
    rollback: autoRollbackConfiguration,
    creator: creator
  }' \
  --output table
```

## メンテナンス作業

### システムメンテナンス時のサービス停止

**手順**:

1. **メンテナンス画面を表示するターゲットグループ作成**
```bash
# メンテナンス用 Fargate タスク起動
aws ecs run-task \
  --cluster ecs-sample-prod \
  --task-definition ecs-sample-maintenance:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx]}"
```

2. **ALB リスナールール切り替え**
```bash
# 通常リスナーを一時停止、メンテナンスリスナーを有効化
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --default-actions Type=forward,TargetGroupArn=<maintenance-tg-arn>
```

3. **メンテナンス実施**
   - DB パッチ適用
   - セキュリティアップデート
   - インフラ変更

4. **サービス復旧**
```bash
# 元のリスナールールに戻す
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:... \
  --default-actions Type=forward,TargetGroupArn=<production-tg-arn>
```

### RDS メンテナンスウィンドウ

```
設定:
  曜日: 日曜日
  開始時刻: 03:00 UTC (12:00 JST)
  期間: 1時間

監視:
  - メンテナンス中もエラーログ監視
  - フェイルオーバー発生を確認
  - スタンバイDB への昇格を監視
```

## コスト最適化

### 定期的なコスト確認

```bash
# 本日のコスト概算
aws ce get-cost-and-usage \
  --time-period Start=2026-04-20,End=2026-04-21 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table

# 昨月比較
aws ce get-cost-and-usage \
  --time-period Start=2026-03-01,End=2026-04-01 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

### コスト削減施策

1. **Fargate Spot の活用**
   - 開発・ステージング環境で使用
   - 本番環境は Fargate on-demand

2. **リソースサイジング**
   - 不要な ECS タスク削除
   - RDS インスタンスタイプ見直し

3. **ストレージ最適化**
   - S3 ライフサイクルポリシー活用
   - CloudWatch Logs 保持期間調整

4. **NAT Gateway の効率化**
   - VPC Endpoint 活用でデータ転送量削減

## チェックリスト

### 週次タスク
- [ ] CloudWatch ダッシュボード確認
- [ ] アラート件数確認
- [ ] エラーログ集計
- [ ] コスト確認

### 月次タスク
- [ ] ストレージ使用量確認
- [ ] IAM アクセスキー ローテーション
- [ ] セキュリティパッチ確認
- [ ] ディザスタリカバリ訓練計画

### 四半期タスク
- [ ] アーキテクチャ見直し
- [ ] キャパシティプランニング
- [ ] セキュリティ監査
- [ ] パフォーマンス チューニング

## 参考資料

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS CloudWatch Logs Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
