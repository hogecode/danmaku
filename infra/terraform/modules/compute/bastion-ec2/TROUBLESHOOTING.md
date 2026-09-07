# Bastion EC2 - トラブルシューティングガイド

## SSM Agent接続の問題

### 症状
```
TargetNotConnected: i-xxx is not connected.
```

### 原因と対処法

#### 1. SSM Agent が起動していない

**確認方法：**
```bash
# User Data スクリプトのログを確認
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "sudo tail -f /var/log/bastion-init.log"
```

**対処法：**
- インスタンスを再起動してUser Dataを再実行
```bash
aws ec2 reboot-instances --instance-ids <INSTANCE_ID> --region ap-northeast-1
```

#### 2. VPC エンドポイントへのアクセスが制限されている

**確認方法：**
```bash
# セキュリティグループの設定を確認
aws ec2 describe-security-groups \
  --group-ids <BASTION_SG_ID> \
  --region ap-northeast-1
```

**対処法：**
- Bastionセキュリティグループがポート443（HTTPS）でVPC エンドポイントにアクセスできるか確認
- VPC エンドポイントセキュリティグループがBastionからのポート443を許可しているか確認

#### 3. IAM ロールの権限不足

**確認方法：**
```bash
# インスタンスのIAM ロールを確認
aws ec2 describe-instances \
  --instance-ids <INSTANCE_ID> \
  --query 'Reservations[0].Instances[0].IamInstanceProfile' \
  --region ap-northeast-1
```

**対処法：**
以下のポリシーがアタッチされているか確認：
- `AmazonSSMManagedInstanceCore` （必須）
- `CloudWatchAgentServerPolicy` （推奨）

#### 4. EC2 Instance Connectを使用した確認

SSMで接続できない場合、EC2 Instance Connectで直接確認：

```bash
# InstanceProfileを確認
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "aws sts get-caller-identity"

# SSM Agent の状態を確認
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "sudo systemctl status amazon-ssm-agent"

# User Data スクリプトのログを確認
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "sudo cat /var/log/bastion-init.log"
```

#### 5. ネットワークの確認

Bastionインスタンスがプライベートサブネットに配置されている場合、以下を確認：

```bash
# VPC エンドポイントが作成されているか確認
aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=<VPC_ID>" \
  --region ap-northeast-1

# インスタンスからVPC エンドポイントへの接続をテスト
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "curl -I https://ssm.ap-northeast-1.amazonaws.com/"
```

## ポートフォワーディングが機能しない

### 症状
```
Error: operation error EC2: StartSession, operation not allowed.
```

### 原因と対処法

1. **AWS CLIのバージョンが古い**
   ```bash
   # AWS CLI v2.13以降が必要
   aws --version
   
   # アップグレード
   pip install --upgrade awscli
   ```

2. **Session Manager プラグインがインストールされていない**
   ```bash
   # インストール
   curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/windows/sessionmanager-bundle.zip" -o "sessionmanager-bundle.zip"
   unzip sessionmanager-bundle.zip
   .\sessionmanager-bundle\install -i C:\Program Files\sessionmanagerplugin -b C:\Program Files\sessionmanagerplugin\bin\session-manager-plugin.exe
   ```

3. **ユーザーのIAM権限不足**
   
   ユーザーが以下のポリシーを持っているか確認：
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ssm:StartSession",
           "ssm:DescribeSessions",
           "ssm:TerminateSession"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "ec2:DescribeInstances"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

## RDS接続エラー

### 症状
```
ERROR 2003 (HY000): Can't connect to MySQL server on 'xxx.rds.amazonaws.com' (111 'Connection refused')
```

### 対処法

1. **Bastionセキュリティグループが正しいか確認**
   ```bash
   # Bastion SG が MySQL/PostgreSQL ポートでエグレス許可
   aws ec2 describe-security-groups \
     --group-ids <BASTION_SG_ID> \
     --region ap-northeast-1
   ```

2. **RDSセキュリティグループが正しいか確認**
   ```bash
   # RDS SG が Bastion SG からのポート 3306/5432 のイングレス許可
   aws ec2 describe-security-groups \
     --group-ids <RDS_SG_ID> \
     --region ap-northeast-1
   ```

3. **RDS認証情報を確認**
   ```bash
   # Bastion内でマスターパスワードを確認
   echo $RDS_MASTER_PASSWORD_SECRET_ARN
   ```

## ログの確認方法

### CloudWatch Logs
```bash
# Bastionのログを確認
aws logs tail /ec2/ecs-sample-bastion-dev --follow --region ap-northeast-1
```

### User Data ログ
```bash
# EC2 Instance Connectを使用
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "sudo cat /var/log/bastion-init.log"
```

### SSM Agent ログ
```bash
aws ec2-instance-connect ssh --instance-id <INSTANCE_ID> \
  --command "sudo tail -f /var/log/amazon/ssm/amazon-ssm-agent.log"
```

## パフォーマンスの確認

```bash
# インスタンスのスペックを確認
aws ec2 describe-instances \
  --instance-ids <INSTANCE_ID> \
  --query 'Reservations[0].Instances[0].[InstanceType,State.Name,Monitoring.State]' \
  --region ap-northeast-1

# CloudWatch メトリクスを確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<INSTANCE_ID> \
  --start-time $(date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average \
  --region ap-northeast-1
```

## サポートへの問い合わせ

問題が解決しない場合、以下の情報を集めて、AWS サポートに問い合わせてください：

- インスタンスID
- User Data スクリプトのログ（/var/log/bastion-init.log）
- CloudWatch Logs
- セキュリティグループの設定
- IAM ロールのポリシー
- 実行環境（AWS リージョン、VPC ID等）
