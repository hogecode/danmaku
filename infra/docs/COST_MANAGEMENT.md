# コスト管理・最適化

## 概要

このドキュメントは、AWSプロジェクトのコスト管理戦略、コスト最適化方法、および費用対効果の高い設計について説明します。

## コスト構造

### サービス別コスト概算（月額）

```
ECS Fargate:           $3,000  (本番 + ステージング + 開発)
RDS:                   $2,000  (Multi-AZ, マルチリージョン検討)
ALB:                   $  500  (ロードバランサー料金)
NAT Gateway:           $  450  (データ転送料金含む)
CloudWatch:            $  300  (ログ保存、メトリクス)
VPC Endpoints:         $  200  (Interface エンドポイント)
ECR:                   $  100  (ストレージ)
その他:                $  450  (S3, Secrets Manager, Lambda等)
━━━━━━━━━━━━━━━━
合計:                  $7,000
```

## コスト最適化戦略

### 1. コンピュートコストの削減

#### Fargate Spot の活用

**開発環境**: 最大75%割引
```
従来: 月 $500
Spot: 月 $125
節約: $375/月
```

**ステージング環境**: 最大60%割引
```
従来: 月 $800
Spot: 月 $320
節約: $480/月
```

**実装方法**:
```json
{
  "capacityProviders": [
    "FARGATE",
    "FARGATE_SPOT"
  ],
  "defaultCapacityProviderStrategy": [
    {
      "capacityProvider": "FARGATE_SPOT",
      "weight": 80,
      "base": 1
    },
    {
      "capacityProvider": "FARGATE",
      "weight": 20
    }
  ]
}
```

**Spot タスク中断への対応**:
- gracefulShutdownTimeout: 120秒
- preDeregistrationDelay: 30秒
- 中断許容度: 非本番環境のみ

#### リソースサイジング最適化

**現在の設定**:
```
Next.js: CPU 256, Memory 512
Go Server: CPU 512, Memory 1024
```

**最適化方針**:
```
現在のメトリクス確認
  ↓
最大使用率が60%以下の場合、スケールダウン検討
  ↓
段階的にサイズを縮小し、パフォーマンス監視
```

**例**:
```
Before:
  - Go Server: CPU 512, Memory 1024
  - 月額: $200

After (最適化):
  - Go Server: CPU 256, Memory 512
  - 月額: $100
  - 節約: $100/月
```

#### オートスケーリング設定見直し

**本番環境**:
- ターゲット CPU: 70% (効率的)
- 最小: 3タスク (高可用性)
- 最大: 10タスク (コスト上限)

**ステージング環境**:
- ターゲット CPU: 75% (コスト重視)
- 最小: 2タスク (基本)
- 最大: 6タスク (コスト制限)

**開発環境**:
- スケジュール停止: 22:00-09:00
- 削減: 月 $300 (営業時間のみ稼動)

### 2. ストレージコストの削減

#### CloudWatch Logs 保持期間の短縮

**現在設定**:
```
本番: 30日
ステージング: 14日
開発: 3日
```

**コスト削減イメージ**:
```
前: $300/月
最適化後: $150/月
削減: $150/月

※ 古いログは S3 へのアーカイブで補完
```

**実装**:
```bash
# CloudWatch Logs ライフサイクルポリシー設定
aws logs put-retention-policy \
  --log-group-name /ecs/go-server \
  --retention-in-days 14
```

#### S3 ライフサイクルポリシー

```json
{
  "Rules": [
    {
      "Id": "ArchiveOldLogs",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

**コスト比較**:
```
S3 Standard: $0.023 / GB / 月
S3 IA:       $0.0125 / GB / 月
S3 Glacier:  $0.004 / GB / 月

例) 100 GB ログ:
  Before: $2.30/月
  After: $1.25 (30日) + $0.40 (90日以降) = $1.65
  削減: $0.65/月
```

#### ECR ライフサイクルポリシー

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 5 images tagged",
      "selection": {
        "tagStatus": "tagged",
        "tagPrefixList": ["v"],
        "countType": "imageCountMoreThan",
        "countNumber": 5
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Delete untagged after 7 days",
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

**削減効果**:
```
不要なイメージ削除: 月 $50-100
```

### 3. データベースコストの削減

#### RDS インスタンスサイズの最適化

**現在**: db.t3.medium (Multi-AZ)
```
月額: $400
```

**最適化検討**:
- CPU使用率が常に30%以下 → db.t3.small 検討
- メモリ使用率が常に40%以下 → スケールダウン候補

**削減イメージ**:
```
db.t3.medium → db.t3.small: -$150/月
db.t3.small → db.t3.micro:  -$100/月
```

#### RDS 予約インスタンス（RI）購入

```
オンデマンド: $400/月
1年RI:      $290/月 (27% 割引)
3年RI:      $240/月 (40% 割引)

3年RI購入:
  初期: $2,880
  月額: 削減 $160
  ROI: 18ヶ月
```

#### バックアップ最適化

```
現在:
  - 自動バックアップ: 7日間
  - 月額: $100

最適化:
  - 自動バックアップ: 3日間
  - 手動バックアップ: 定期実施
  - 月額: $50
  - 削減: $50/月
```

### 4. ネットワークコストの削減

#### VPC エンドポイント活用

**NAT Gateway の使用削減**:
```
NAT Gateway: $0.045 / GB
VPC Endpoint: $7.20 / 月 (固定)

従来 (NAT経由 S3 アクセス):
  - 月 100 GB データ転送: $4.50 + NAT Gateway 使用料

最適化 (VPC Endpoint):
  - S3 Gateway Endpoint: 無料
  - CloudWatch Logs Interface Endpoint: $7.20
  - 月額: $7.20

削減: $80 - $90/月
```

**実装**:
```bash
# Gateway Endpoint (S3, DynamoDB)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-xxxxx \
  --service-name com.amazonaws.ap-northeast-1.s3 \
  --route-table-ids rtb-xxxxx

# Interface Endpoint (CloudWatch Logs, ECR等)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-xxxxx \
  --vpc-endpoint-type Interface \
  --service-name com.amazonaws.ap-northeast-1.logs \
  --subnet-ids subnet-xxxxx
```

#### ALB アイドルタイムアウト最適化

```
現在: 60秒
最適化: 30秒

効果: 一時的な接続保持によるコスト削減
```

## コスト追跡・分析

### AWS Cost Explorer 利用

**定期的なコスト確認**:

```bash
# 日次コスト
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '1 day ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table

# 月別推移
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-04-30 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table

# サービス別詳細
aws ce get-cost-and-usage \
  --time-period Start=2026-04-01,End=2026-04-30 \
  --granularity MONTHLY \
  --metrics UnblendedCost,UsageQuantity \
  --group-by Type=DIMENSION,Key=REGION \
  --filter file://filter.json
```

### CloudWatch メトリクスベースのコスト分析

**カスタムメトリクス作成**:

```python
import boto3
from datetime import datetime

cloudwatch = boto3.client('cloudwatch')

def estimate_daily_cost():
    # ECS コスト計算
    ecs_cost = get_ecs_instance_cost()
    # RDS コスト計算
    rds_cost = get_rds_instance_cost()
    # その他
    other_cost = get_other_services_cost()
    
    total = ecs_cost + rds_cost + other_cost
    
    # CloudWatch に発行
    cloudwatch.put_metric_data(
        Namespace='CostManagement',
        MetricData=[
            {
                'MetricName': 'DailyEstimatedCost',
                'Value': total,
                'Unit': 'None',
                'Timestamp': datetime.now()
            }
        ]
    )
    
    return total
```

### Cost Anomaly Detection

```bash
# コスト異常検知設定
aws ce create-anomaly-monitor \
  --anomaly-monitor '{
    "MonitorName": "ECS-Anomaly",
    "MonitorType": "DIMENSIONAL",
    "MonitorDimension": "SERVICE"
  }' \
  --anomaly-monitor-frequency DAILY
```

## 環境別コスト管理

### 本番環境

```
月額目標: $4,000
配分:
  - ECS (Fargate On-Demand): $2,000
  - RDS (db.t3.medium): $400
  - ALB, NAT, VPC: $700
  - CloudWatch, CloudFront等: $900
```

**コスト監視**:
- 日次: ダッシュボード確認
- 週次: トレンド分析
- 月次: 詳細分析、最適化検討

### ステージング環境

```
月額目標: $1,500
配分:
  - ECS (Fargate Spot): $300
  - RDS (db.t3.small): $200
  - ALB, NAT, VPC: $500
  - CloudWatch等: $500
```

**コスト削減テクニック**:
- スケジュール停止（夜間）
- Spot 使用
- リソースサイズの削減

### 開発環境

```
月額目標: $500
配分:
  - ECS (Fargate Spot): $100
  - RDS (db.t3.micro): $50
  - 共有インフラ: $350
```

**コスト最適化**:
- 営業時間のみ稼動
- 最小リソース設定
- 不要時は完全停止

## コスト最適化チェックリスト

### 月次実施項目

- [ ] Cost Explorer で月額確認
- [ ] サービス別コスト確認
- [ ] リソース使用率分析
  - ECS: CPU/メモリ
  - RDS: CPU/接続数/ストレージ
  - ネットワーク: データ転送量

- [ ] 異常値確認
  - 前月比 20% 以上の増加
  - 予期しないサービス利用

### 四半期実施項目

- [ ] RI 購入検討
  - RDS 1年 or 3年
  - ネットワーク RI（検討）

- [ ] リソースサイズ最適化
  - ECS タスク定義再評価
  - RDS インスタンスタイプ見直し

- [ ] アーキテクチャ見直し
  - 不要なサービス削除
  - 代替サービス検討

## コスト削減シナリオ

### 現状コスト: $7,000/月

### シナリオ 1: 段階的最適化
```
施策:
  1. Spot を80%適用 (開発) → -$300
  2. ログ保持期間短縮 → -$150
  3. リソースサイズ最適化 → -$200
  4. RI 購入 (RDS 3年) → -$160
  
合計削減: -$810/月
結果: $6,190/月 (11.6% 削減)
```

### シナリオ 2: 積極的最適化
```
施策:
  1. Spot 60% 適用 (本番+ステージング) → -$800
  2. ログ保持期間短縮 → -$150
  3. リソースサイズ大幅削減 → -$500
  4. RI 購入 (3年) → -$200
  5. マルチリージョン削除 → -$500
  
合計削減: -$2,150/月
結果: $4,850/月 (30.7% 削減)
```

## コスト最適化の実装ロードマップ

### フェーズ 1（月1-2）
- [ ] Spot 導入（開発環境）
- [ ] ログ保持期間調整
- [ ] CloudWatch Insights 分析開始

### フェーズ 2（月3-4）
- [ ] リソースサイズ最適化
- [ ] VPC Endpoint 展開
- [ ] RI 購入検討

### フェーズ 3（月5-6）
- [ ] Cost Anomaly Detection 導入
- [ ] 定期的なコスト レビュー
- [ ] チーム全体のコスト意識向上

## コスト予測モデル

```
月額予測 = 
  (ECS_タスク数 * CPU時間 * $0.04048) +
  (RDS_インスタンスタイプ_月額) +
  (データ転送量 * $0.14 / GB) +
  (CloudWatch_ログサイズ * $0.50 / GB)
  + その他固定費
```

**例**:
```
ECS: 5タスク * 730時間 * 0.04048 = $146
RDS: $400
データ転送: 50GB * $0.14 = $7
CloudWatch: 50GB * $0.50 = $25
他: $100
━━━━━━━━━━━━━━━
合計: $678/月
```

## 参考資料

- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Cost Explorer User Guide](https://docs.aws.amazon.com/awsaccountbilling/latest/userguide/ce-what-is.html)
- [AWS Well-Architected Framework - Cost Optimization](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/)
- [AWS Savings Plans Documentation](https://docs.aws.amazon.com/savingsplans/)
