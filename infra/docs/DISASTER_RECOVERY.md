# 災害復旧・ビジネス継続性計画（DRBC）

## 概要

このドキュメントは、想定される災害シナリオに対する復旧戦略、RTO/RPO定義、復旧手順、および定期的な訓練について説明します。

## RTO・RPO定義

### Recovery Time Objective（RTO）- 目標復旧時間

| 環境 | RTO | 説明 |
|------|-----|------|
| 本番 | 1時間 | サービス停止許容時間 |
| ステージング | 4時間 | テスト環境は優先度低 |
| 開発 | 24時間 | 開発環境は優先度最低 |

### Recovery Point Objective（RPO）- 目標復旧地点

| サービス | RPO | 実装方法 |
|---------|-----|---------|
| RDS | 15分 | 自動バックアップ (15分間隔) |
| S3 | 1時間 | バージョニング有効 |
| ECR | 同期 | プッシュ直後にバックアップ |
| アプリケーション | N/A | コードは GitHub で管理 |

## 災害シナリオ別復旧計画

### シナリオ 1: リージョン停止

**想定**: AWS リージョン全体が利用不可（自然災害、インフラ故障等）

**検知**: AWS Health Notifications

**復旧手順**:

1. **状況把握** (5分)
```bash
# AWS Status Page 確認
# AWS Health Dashboard 確認
aws health describe-events --filter eventTypeCategories=issue
```

2. **フェイルオーバー決定** (5分)
   - RTO 1時間以上であれば、別リージョンへのフェイルオーバー判断

3. **スタンバイ環境起動** (30分)
```bash
# バックアップから新リージョンへ RDS 復元
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ecs-sample-prod-dr \
  --db-snapshot-identifier ecs-sample-prod-backup-latest \
  --availability-zone ap-southeast-1a

# ECR イメージをスタンバイリージョンにコピー
aws ecr create-repository \
  --repository-name ecs-sample \
  --region ap-southeast-1

aws ecr batch-get-image \
  --repository-name ecs-sample \
  --image-ids imageTag=latest \
  --region ap-northeast-1 \
  | jq '.images[].imageManifest' \
  | xargs -I {} aws ecr put-image \
    --repository-name ecs-sample \
    --image-manifest {} \
    --region ap-southeast-1
```

4. **ECS サービス起動** (15分)
```bash
# スタンバイリージョンで ECS クラスタ起動
aws ecs create-cluster \
  --cluster-name ecs-sample-dr \
  --region ap-southeast-1

# タスク定義登録
aws ecs register-task-definition \
  --cli-input-json file://task-definition-dr.json \
  --region ap-southeast-1

# サービス作成
aws ecs create-service \
  --cluster ecs-sample-dr \
  --service-name ecs-sample-service \
  --task-definition ecs-sample-go:1 \
  --desired-count 3 \
  --region ap-southeast-1
```

5. **DNS フェイルオーバー** (5分)
```bash
# Route 53 ヘルスチェック自動切り替え
# または手動で weighted routing policy 更新
aws route53 change-resource-record-sets \
  --hosted-zone-id ZXXXXX \
  --change-batch file://dns-failover.json
```

6. **検証** (10分)
   - 新リージョンのエンドポイント確認
   - ヘルスチェック実行
   - 簡単なテスト実施

**所要時間**: 最大 1時間

**確認項目**:
- [ ] RDS が起動したか（マスタ/スレーブ確認）
- [ ] ECR イメージ取得可能か
- [ ] ECS タスク正常に起動したか
- [ ] ALB がターゲット認識したか
- [ ] DNS が新リージョンに向いているか

### シナリオ 2: データベース故障

**想定**: RDS インスタンスの予期しないダウン

**検知**: CloudWatch Alarm (DB Connectivity)

**復旧手順**:

1. **自動フェイルオーバー（Multi-AZ）** (1-2分)
   - RDS Multi-AZ が自動的にスタンバイへフェイルオーバー
   - エンドポイント変更なし

2. **手動復旧が必要な場合** (5分)
```bash
# 最新バックアップから復元
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ecs-sample-prod-restored \
  --db-snapshot-identifier ecs-sample-prod-backup-latest

# 新インスタンスのエンドポイント確認
aws rds describe-db-instances \
  --db-instance-identifier ecs-sample-prod-restored \
  --query 'DBInstances[0].Endpoint.Address'

# アプリケーション接続文字列更新
# Secrets Manager に新エンドポイント登録
aws secretsmanager update-secret \
  --secret-id rds/prod \
  --secret-string '{"host":"new-endpoint.rds.amazonaws.com","port":3306,"username":"admin"}'

# ECS タスク再起動（新しいシークレット取得）
aws ecs update-service \
  --cluster ecs-sample-prod \
  --service ecs-sample-service \
  --force-new-deployment
```

**所要時間**: 最大 15分

### シナリオ 3: ECS タスク大量停止

**想定**: 実行中のタスクが異常停止、クラスタが不安定

**検知**: CloudWatch Alarm (タスク停止)、ECS Event Stream

**復旧手順**:

1. **状況分析** (5分)
```bash
# 停止したタスク確認
aws ecs list-tasks \
  --cluster ecs-sample-prod \
  --desired-status STOPPED

# タスク詳細確認
aws ecs describe-tasks \
  --cluster ecs-sample-prod \
  --tasks <task-arn> \
  --query 'tasks[0].{stoppedReason,stoppedCode,exitCode}'

# ログ確認
aws logs tail /ecs/go-server --follow --filter-pattern "ERROR"
```

2. **問題の根本原因特定**
   - OOM (Out of Memory) → メモリ増加、タスク数削減
   - ECR イメージ取得エラー → ネットワーク確認、IAM 確認
   - ポート競合 → ホストリソース確認
   - セキュリティグループ → SG ルール確認

3. **サービス再起動**
```bash
# デプロイメント強制
aws ecs update-service \
  --cluster ecs-sample-prod \
  --service ecs-sample-service \
  --force-new-deployment

# または望ましい数に強制設定
aws ecs update-service \
  --cluster ecs-sample-prod \
  --service ecs-sample-service \
  --desired-count 5
```

4. **検証**
   - ALB ターゲット正常性確認
   - アプリケーションログ確認
   - メトリクス確認

**所要時間**: 5-15分

### シナリオ 4: アプリケーション障害

**想定**: 新デプロイ後にエラー発生、または本番バグ

**検知**: CloudWatch Alarm (5xx エラー率)

**復旧手順**:

1. **迅速なロールバック** (3分)
```bash
# 前のタスク定義確認
aws ecs describe-services \
  --cluster ecs-sample-prod \
  --services ecs-sample-service \
  --query 'services[0].deployments[].{
    taskDefinition: taskDefinition,
    status: status,
    runningCount: runningCount
  }'

# 前のタスク定義に切り替え
aws ecs update-service \
  --cluster ecs-sample-prod \
  --service ecs-sample-service \
  --task-definition ecs-sample-go:10  # 前バージョン
  --force-new-deployment
```

2. **検証**
```bash
# トラフィック復旧確認
aws logs tail /ecs/go-server --follow --filter-pattern "ERROR|WARN"

# メトリクス確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name HTTPCode_Target_5XX_Count \
  --start-time 2026-04-20T10:00:00Z \
  --end-time 2026-04-20T10:05:00Z \
  --period 60 \
  --statistics Sum
```

3. **障害分析**
   - X-Ray トレース確認
   - ログ詳細分析
   - パフォーマンスプロファイリング

**所要時間**: 3-10分

### シナリオ 5: DDoS 攻撃

**想定**: 大量のリクエストによるサービス停止

**検知**: CloudWatch Alarm (リクエスト数異常)、AWS Shield Notifications

**復旧手順**:

1. **自動防御（AWS Shield）**
   - Shield Standard：自動的に DDoS 軽減
   - Shield Advanced：追加ルール適用

2. **WAF ルール強化** (5分)
```bash
# Rate limiting ルール適用
aws wafv2 create-rule-group \
  --name DDoS-Protection \
  --scope REGIONAL \
  --capacity 100 \
  --rules '[{
    "Name": "RateLimit",
    "Priority": 0,
    "Statement": {
      "RateBasedStatement": {
        "Limit": 1000,
        "AggregateKeyType": "IP"
      }
    },
    "Action": {"Block": {}},
    "VisibilityConfig": {"SampledRequestsEnabled": true, "CloudWatchMetricsEnabled": true, "MetricName": "RateLimitRule"}
  }]'
```

3. **トラフィック監視**
```bash
# リアルタイムトラフィック確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --start-time $(date -d '10 minutes ago' -u +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 \
  --statistics Sum
```

4. **信号通知**
   - SNS で関係者に通知
   - ステータスページ更新

**所要時間**: 5-15分

## バックアップ・リストア戦略

### RDS バックアップ

**自動バックアップ**:
```
保持期間: 7日間
バックアップ時刻: 03:00 UTC (12:00 JST)
```

**手動スナップショット**:
```
実行: 毎日 22:00 JST
保持: 1ヶ月分
```

**リストア手順**:
```bash
# スナップショット一覧
aws rds describe-db-snapshots \
  --db-instance-identifier ecs-sample-prod \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]' \
  --output table

# リストア
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ecs-sample-prod-restored \
  --db-snapshot-identifier ecs-sample-prod-20260420-1000 \
  --availability-zone ap-northeast-1a

# パラメータグループ確認
aws rds modify-db-instance \
  --db-instance-identifier ecs-sample-prod-restored \
  --db-parameter-group-name default.mysql8.0
```

### S3 アーティファクト バックアップ

**バージョニング有効化**:
```
状態: Enabled
MFA Delete: 有効化（本番環境）
```

**ライフサイクル設定**:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpirationInDays": 30
    }
  ]
}
```

### ECR イメージ バックアップ

**ライフサイクルポリシー**:
```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep production tagged images",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

**クロスリージョンレプリケーション**（検討中）:
```bash
aws ecr create-repository \
  --repository-name ecs-sample \
  --region ap-southeast-1

# 自動レプリケーション設定
aws ecr put-replication-configuration \
  --replication-configuration '{
    "rules": [{
      "destinations": [{
        "region": "ap-southeast-1",
        "registryId": "123456789012"
      }],
      "repositoryFilters": [{
        "filter": "prefix-list",
        "filterValue": ["ecs-sample"]
      }]
    }]
  }'
```

## 定期訓練（Disaster Recovery Drill）

### 四半期ごとの訓練実施

#### Q1 訓練: RDS 復旧シミュレーション（3月）

**実施手順**:
1. 本番 RDS スナップショット作成
2. ステージング環境で復元テスト
3. データ整合性確認
4. 復旧時間測定

**参加者**: DBA, インフラエンジニア
**所要時間**: 2時間
**文書化**: チェックリスト更新

#### Q2 訓練: リージョンフェイルオーバー（6月）

**実施手順**:
1. スタンバイリージョンの構成確認
2. スタンバイ環境へのデータ同期確認
3. DNS フェイルオーバータイミング確認
4. RTO 測定

**参加者**: 全チーム
**所要時間**: 3時間
**文書化**: 復旧手順書更新

#### Q3 訓練: アプリケーション復旧（9月）

**実施手順**:
1. ECR イメージの復旧確認
2. タスク定義の検証
3. 本番環境で事前テスト
4. ロールバック手順確認

**参加者**: 開発チーム、インフラチーム
**所要時間**: 1.5時間

#### Q4 訓練: 統合 DR 訓練（12月）

**実施手順**:
1. リージョン停止シミュレーション
2. 全サービスの復旧確認
3. エンドツーエンドテスト
4. 年間改善点の整理

**参加者**: 全スタッフ
**所要時間**: 4時間

## 復旧手順書

### チェックリスト: リージョン障害時フェイルオーバー

```
□ 1. 状況確認 (5分)
  □ AWS Health Dashboard 確認
  □ Slack / Email で関係者通知
  □ Incident Channel 作成

□ 2. 決定 (10分)
  □ フェイルオーバー意思決定
  □ スタンバイリージョン確認 (ap-southeast-1)
  □ 経営層・顧客への通知準備

□ 3. スタンバイ環境起動 (30分)
  □ RDS: バックアップから復元開始
  □ VPC: スタンバイ VPC 確認
  □ ECR: イメージをコピー
  □ IAM: ロール・ポリシー確認

□ 4. アプリケーション起動 (20分)
  □ ECS クラスタ起動
  □ タスク定義登録
  □ サービス作成
  □ ALB 構成

□ 5. DNS 切り替え (5分)
  □ Route 53 ヘルスチェック確認
  □ 必要に応じて手動切り替え
  □ TTL 監視

□ 6. 検証 (10分)
  □ ヘルスチェック実行
  □ 簡単なテスト実施
  □ パフォーマンス確認

□ 7. 通知・報告 (5分)
  □ ステータスページ更新
  □ 顧客通知
  □ 内部チーム通知

□ 8. 復旧後処理 (継続)
  □ ログ分析
  □ 根本原因調査
  □ 改善点整理
  □ 訓練実施

合計 RTO: 最大 1時間
```

## 文書管理

### 文書の保管場所

```
復旧手順書:          docs/
バックアップスクリプト: scripts/backup/
テスト環境構成:      terraform/dr/
訓練ドキュメント:    docs/drills/
インシデント記録:    logs/incidents/
```

### 定期確認項目

| 項目 | 頻度 | 責任者 |
|------|------|--------|
| 手順書内容確認 | 月 | インフラリード |
| スナップショット確認 | 週 | DBA |
| バックアップスクリプト動作確認 | 月 | インフラエンジニア |
| RTO/RPO 測定 | 四半期 | チームリード |
| 訓練実施 | 四半期 | CTO |

## ビジネス影響分析（BIA）

### サービス優先度

| サービス | 優先度 | RTO | RPO | 影響 |
|---------|------|-----|-----|------|
| Go API Server | Critical | 1h | 15min | ビジネス停止 |
| Next.js Web | High | 2h | 30min | 顧客影響 |
| RDS | Critical | 30min | 15min | データ喪失 |
| 管理画面 | Medium | 4h | 1h | 内部効率低下 |

## 重要な連絡先

```
CTO: [連絡先]
リードエンジニア: [連絡先]
インフラリード: [連絡先]
DBA: [連絡先]
24/7 On-Call: [連絡先]
```

## 参考資料

- [AWS Disaster Recovery Solutions](https://aws.amazon.com/disaster-recovery/)
- [AWS Backup User Guide](https://docs.aws.amazon.com/aws-backup/)
- [RDS User Guide - Backups and Restore](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html)
- [ECS Disaster Recovery](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/disaster-recovery-resiliency.html)
- [AWS Business Continuity Best Practices](https://aws.amazon.com/jp/blogs/news/disaster-recovery-dr-best-practices-in-aws/)
