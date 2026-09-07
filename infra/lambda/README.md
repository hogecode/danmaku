# S3 File Validation Lambda Function

TypeScript で書かれた AWS Lambda 関数で、S3 にアップロードされたファイルを検証します。

## 📋 概要

このLambda関数は以下の機能を提供します：

- **ファイル形式チェック**: 許可されたMIMEタイプ（JPEG, PNG, GIF, PDF）のみを受け入れます
- **ファイルサイズチェック**: 最大10MBまでのファイルを許可します
- **CloudWatch Logs統合**: 検証結果をログに出力します
- **S3イベントトリガー**: S3のObjectCreatedイベントによって自動的にトリガーされます

## 🏗️ ファイル構造

```
lambda/
├── src/
│   └── index.ts           # Lambda ハンドラーのメインコード
├── package.json           # npm 依存関係設定
├── tsconfig.json          # TypeScript コンパイル設定
├── .gitignore             # Git除外ファイル
└── README.md              # このファイル
```

## 📦 依存関係

- `@aws-sdk/client-s3`: AWS SDK v3 for S3
- `@types/aws-lambda`: AWS Lambda イベント型定義
- `@types/node`: Node.js 型定義
- `typescript`: TypeScript コンパイラ

## 🔨 ビルド

### 前提条件

- Node.js 18+ がインストールされていること
- npm または yarn

### ビルド手順

```bash
# 依存関係をインストール
npm install

# TypeScript をコンパイル
npm run build

# または一度にクリーン＆ビルド
npm run prebuild && npm run build
```

コンパイル後、`dist/` ディレクトリに JavaScript ファイルが生成されます。

## 🚀 デプロイ

### Terraform でのデプロイ

このLambda関数は Terraform モジュール（`terraform/modules/lambda`）で管理されており、`terraform/main.tf` で以下のように呼び出されます：

```hcl
module "s3_validation_lambda" {
  source = "./modules/lambda"

  lambda_function_name = "s3-file-validator"
  lambda_handler       = "index.handler"
  lambda_runtime       = "nodejs20.x"
  lambda_source_path   = "${path.module}/../lambda"

  enable_s3_trigger = var.enable_s3_validation_lambda
  s3_bucket_id      = try(module.storage.file_upload_bucket_id, "")
  s3_key_prefix     = "uploads/"
}
```

### Terraform でのデプロイ実行

```bash
cd terraform

# プラン確認
terraform plan

# 適用
terraform apply
```

## ⚙️ 設定

### 許可されたファイル形式

デフォルトでは以下のMIMEタイプが許可されています：

- `image/jpeg` - JPEG 画像
- `image/png` - PNG 画像
- `image/gif` - GIF 画像
- `application/pdf` - PDF ドキュメント

`src/index.ts` の `ALLOWED_MIME_TYPES` 配列を編集して変更できます。

### ファイルサイズ制限

デフォルトの最大ファイルサイズは **10MB** です。

`src/index.ts` の `MAX_FILE_SIZE` 定数を編集して変更できます：

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

## 📝 環境変数

Lambda関数は以下の環境変数を使用します：

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `AWS_REGION` | `ap-northeast-1` | AWS リージョン（自動設定） |
| `MAX_FILE_SIZE_MB` | `10` | 最大ファイルサイズ（MB） |

## 🔐 IAM パーミッション

Terraform により、以下の IAM ポリシーが自動的にアタッチされます：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketVersioning"
      ],
      "Resource": "arn:aws:s3:::BUCKET_NAME"
    }
  ]
}
```

## 📊 CloudWatch Logs

検証結果は CloudWatch Logs に出力されます。

### ログフォーマット

```
✅ VALID: uploads/image.jpg (Size: 1024000 bytes, Type: image/jpeg)
❌ INVALID: uploads/video.mp4 - 許可されていないファイル形式です: video/mp4
```

## 🧪 ローカルテスト

### SAM（Serverless Application Model）でのテスト

```bash
# SAM のインストール（初回のみ）
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# ビルド
sam build

# ローカル実行（ポート 3001）
sam local start-api
```

### テストイベント

サンプルの S3 イベント JSON：

```json
{
  "Records": [
    {
      "eventSource": "aws:s3",
      "eventName": "ObjectCreated:Put",
      "s3": {
        "bucket": {
          "name": "my-bucket"
        },
        "object": {
          "key": "uploads/test-image.jpg"
        }
      }
    }
  ]
}
```

## 📈 今後の拡張機能

このLambda関数は最小限の機能で実装されています。以下の拡張が可能です：

- [ ] ウイルススキャン機能（ClamAV 統合）
- [ ] 画像メタデータ検証
- [ ] DynamoDB へのスキャン結果保存
- [ ] SNS/SQS による通知
- [ ] カスタム検証ロジックの追加

## 🐛 トラブルシューティング

### Lambda がトリガーされない

1. S3 バケットの通知設定確認
   ```bash
   aws s3api get-bucket-notification-configuration --bucket BUCKET_NAME
   ```

2. Lambda に S3 の呼び出し権限があることを確認
   ```bash
   aws lambda get-policy --function-name s3-file-validator
   ```

### CloudWatch ログが表示されない

1. ログストリームの確認
   ```bash
   aws logs describe-log-groups --query 'logGroups[?contains(logGroupName, `s3-file-validator`)]'
   ```

2. Lambda の実行ロールに CloudWatch Logs 権限があることを確認

## 📚 参考資料

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Terraform AWS Lambda Module](https://registry.terraform.io/modules/terraform-aws-modules/lambda/aws/latest)

## 📝 ライセンス

このプロジェクトのライセンスに従います。
