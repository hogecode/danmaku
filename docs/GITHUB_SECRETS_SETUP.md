# GitHub Secrets セットアップガイド

## DB マイグレーション実行に必要な Secrets

以下の Secrets を GitHub リポジトリに登録してください：

### 既存 Secrets（デプロイ用）
```
AWS_REGION                   = ap-northeast-1
AWS_ACCOUNT_ID               = 885547925004
AWS_ROLE_ARN                 = arn:aws:iam::885547925004:role/github-actions-role
ECR_NEXTJS_REPOSITORY_NAME   = ecs-nextjs
ECR_NESTJS_REPOSITORY_NAME   = ecs-nestjs
ECS_CLUSTER_NAME             = ecs-sample-cluster-dev
ECS_NEXTJS_SERVICE_NAME      = ecs-sample-nextjs-service
ECS_NESTJS_SERVICE_NAME      = ecs-sample-nestjs-service
```

### 新規追加 Secrets（DB マイグレーション用）
```
DB_SUBNET_IDS                = subnet-xxx,subnet-yyy  # カンマ区切り
NESTJS_SECURITY_GROUP_ID     = sg-xxxxxxxx
```

---

## 設定手順

### ステップ 1: DB_SUBNET_IDS を確認

```bash
# 環境変数を設定
export AWS_REGION=ap-northeast-1
export VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=ecs-sample-vpc-dev" \
  --query 'Vpcs[0].VpcId' \
  --output text)

# DB Subnet の ID を取得（private-db タグ付き）
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --region $AWS_REGION \
  --query 'Subnets[?Tags[?Key==`Type` && Value==`private-db`]].SubnetId' \
  --output text
```

出力例:
```
subnet-0123456789abcdef0 subnet-0123456789abcdef1
```

**GitHub Secrets に登録**:
```
DB_SUBNET_IDS = subnet-0123456789abcdef0,subnet-0123456789abcdef1
```

### ステップ 2: NESTJS_SECURITY_GROUP_ID を確認

```bash
# NestJS Security Group の ID を取得
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=ecs-sample-nestjs-sg-dev" \
  --region $AWS_REGION \
  --query 'SecurityGroups[0].GroupId' \
  --output text
```

出力例:
```
sg-0123456789abcdef0
```

**GitHub Secrets に登録**:
```
NESTJS_SECURITY_GROUP_ID = sg-0123456789abcdef0
```

### ステップ 3: GitHub でシークレット登録

1. リポジトリ → Settings → Secrets and variables → Actions
2. "New repository secret" をクリック
3. 以下を入力:

```
Name:  DB_SUBNET_IDS
Value: subnet-xxx,subnet-yyy
```

```
Name:  NESTJS_SECURITY_GROUP_ID
Value: sg-xxxxxxxx
```

4. "Add secret" をクリック

---

## 確認コマンド

すべてのシークレットが正しく設定されているか確認：

```bash
# GitHub CLI を使用
gh secret list

# 出力例:
# DB_SUBNET_IDS                  Updated 2024-01-01
# NESTJS_SECURITY_GROUP_ID       Updated 2024-01-01
# AWS_REGION                     Updated 2024-01-01
# AWS_ACCOUNT_ID                 Updated 2024-01-01
# AWS_ROLE_ARN                   Updated 2024-01-01
# ECR_NESTJS_REPOSITORY_NAME     Updated 2024-01-01
# ECS_CLUSTER_NAME               Updated 2024-01-01
```

---

## トラブルシューティング

### Q: シークレットが不足している

**エラー**:
```
Error: The secrets are not available in the context
```

**解決策**:
```bash
# 登録されているシークレット一覧を確認
gh secret list

# 不足しているシークレットを追加
gh secret set DB_SUBNET_IDS -b "subnet-xxx,subnet-yyy"
```

### Q: ECS タスク実行権限がない

**エラー**:
```
User: arn:aws:iam::...:assumed-role/.../... is not authorized to perform: ecs:RunTask
```

**解決策**:
GitHub OIDC ロール（AWS_ROLE_ARN）に以下の権限を追加：

```json
{
  "Effect": "Allow",
  "Action": [
    "ecs:RunTask",
    "ecs:DescribeTasks",
    "ecs:DescribeTaskDefinition",
    "ecs:DescribeServices",
    "iam:PassRole"
  ],
  "Resource": "*"
}
```

### Q: DB に接続できない

**エラー**:
```
Error: connect ECONNREFUSED <RDS_ENDPOINT>
```

**確認項目**:
1. NESTJS_SECURITY_GROUP_ID が RDS Security Group のインバウンドを許可しているか
2. DB_SUBNET_IDS が RDS と同一 VPC か

```bash
# RDS のセキュリティグループ確認
aws rds describe-db-instances \
  --query 'DBInstances[0].VpcSecurityGroups' \
  --output table

# NestJS SG がインバウンドルール 5432/tcp を許可しているか確認
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxx \
  --query 'SecurityGroups[0].IpPermissions' \
  --output table
```

---
