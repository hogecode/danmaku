# ニコ動 非同期ダウンロード API

## 概要

BullMQ（Redisキュー）+ Playwright（ブラウザ自動化）+ S3（ストレージ）を組み合わせた非同期ダウンロードAPI。

## アーキテクチャ

```
クライアント
  ↓
POST /api/nicovideo/download/video
  ↓ (即座にjobIdを返す)
NicovideoDownloadService
  ↓
BullMQ Redis Queue
  ↓
NicovideoDownloadProcessor (ワーカー)
  - Playwright ブラウザ起動
  - ニコ動ページアクセス
  - 動画ダウンロード
  - S3 アップロード
  - 進捗イベント発行 (Redis Pub/Sub)
  ↓
GET /api/nicovideo/download/progress/:jobId/sse
  (SSEで進捗をリアルタイム配信)
```

## エンドポイント仕様

### 1. ダウンロード開始

```
POST /api/nicovideo/download/video

リクエスト:
{
  "videoId": "sm12345678",
  "quality": "high",           // "high", "low", "auto" (オプション)
  "downloadComments": false    // オプション
}

レスポンス (即座に返す):
{
  "jobId": "job_1729000000000_abc123def",
  "videoId": "sm12345678",
  "status": "queued",
  "message": "ダウンロードを開始しました"
}
```

### 2. ステータス確認

```
GET /api/nicovideo/download/status/:jobId

レスポンス:
{
  "jobId": "job_1729000000000_abc123def",
  "status": "processing",  // "queued" | "processing" | "completed" | "failed"
  "videoId": "sm12345678",
  "progress": {
    "step": "downloading_video",
    "percentage": 45,
    "message": "動画をダウンロード中..."
  },
  "result": null  // 完了時に結果が入る
}
```

### 3. 進捗ストリーム (SSE)

```
GET /api/nicovideo/download/progress/:jobId/sse

Content-Type: text/event-stream

data: {"jobId":"...","type":"progress","progress":{"step":"initializing","percentage":5}}
data: {"jobId":"...","type":"progress","progress":{"step":"accessing_nicovideo","percentage":10}}
...
data: {"jobId":"...","type":"progress","progress":{"step":"completed","percentage":100}}
```

### 4. キャンセル

```
DELETE /api/nicovideo/download/:jobId

レスポンス:
{
  "jobId": "job_1729000000000_abc123def",
  "message": "ダウンロードをキャンセルしました",
  "status": "cancelled"
}
```

## ファイル構成

```
src/nicovideo/
├── queues/
│   ├── nicovideo-download.job.ts         # ジョブデータ型定義
│   ├── nicovideo-download.queue.ts       # キュー初期化
│   ├── nicovideo-download.processor.ts   # ワーカー実装
│   └── index.ts
│
├── services/
│   ├── nicovideo-download.service.ts     # キュー管理サービス
│   ├── nicovideo-storage.service.ts      # S3操作サービス
│   ├── nicovideo-video.service.ts        # (既存)
│   ├── nicovideo-comment.service.ts      # (既存)
│   └── index.ts
│
├── dto/
│   ├── video-download-response.dto.ts    # レスポンスDTO
│   ├── download-video.dto.ts             # (既存・拡張)
│   └── index.ts
│
├── nicovideo.controller.ts    # API エンドポイント
├── nicovideo.module.ts        # BullMQ登録
├── nicovideo-sse.service.ts   # SSE管理
└── DOWNLOAD_API.md            # このファイル

common/
└── storage/
    ├── s3-storage.service.ts  # S3クライアント
    └── index.ts
```

## 環境変数

```
# AWS S3
AWS_S3_ENABLED=true
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=danmaku-downloads
AWS_S3_PREFIX=nicovideo/
AWS_S3_EXPIRATION_HOURS=24

# Playwright
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=300000
BROWSER_CONCURRENCY=2

# Queue
NICOVIDEO_QUEUE_CONCURRENCY=2
NICOVIDEO_DOWNLOAD_TIMEOUT=300000
NICOVIDEO_DOWNLOAD_MAX_RETRIES=3

# Redis (既存)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 実装詳細

### Processor (ワーカー)

**@nestjs/bullmq** の `Processor` + `WorkerHost` を使用。

```typescript
@Processor('nicovideo-download')
export class NicovideoDownloadProcessor extends WorkerHost<NicovideoDownloadJobData> {
  async process(job: Job<NicovideoDownloadJobData>): Promise<NicovideoDownloadJobResult> {
    // 1. Playwright起動
    // 2. ニコ動アクセス
    // 3. 動画ダウンロード
    // 4. S3アップロード
    // 5. 進捗イベント発行 (Redis Pub/Sub)
  }
}
```

### SSE管理

Redis Pub/Sub でワーカーからの進捗をクライアントへストリーム配信。

```typescript
res.setHeader('Content-Type', 'text/event-stream');
redis.subscribe(`nicovideo-download:${jobId}`);
redis.on('message', (chan, message) => {
  res.write(`data: ${message}\n\n`);
});
```

### S3ストレージ

AWS SDK v3 を使用。署名付きURL（有効期限付き）でダウンロード提供。

```typescript
await s3Client.send(new PutObjectCommand({ ... }));
const url = await getSignedUrl(s3Client, command, { expiresIn: 86400 });
```

## メリット

✅ **API爆速** - ジョブ追加後、数msでレスポンス返却
✅ **メモリ安全** - Playwrightの同時実行数を `concurrency: 2` で制限
✅ **スケーラブル** - ワーカーを独立プロセスに分離可能
✅ **リトライ自動** - BullMQ ネイティブで失敗時自動復旧
✅ **リアルタイム進捗** - SSE でブラウザへストリーム配信
✅ **セキュア** - S3署名付きURLで一時的アクセス制限

## セットアップ

1. **AWS S3 認証情報を設定**
   ```bash
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   AWS_S3_BUCKET=danmaku-downloads
   ```

2. **依存関係をインストール**
   ```bash
   yarn install
   ```

3. **サーバーを起動**
   ```bash
   yarn start:dev
   ```

4. **テスト**
   ```bash
   # ダウンロード開始
   curl -X POST http://localhost:3001/api/nicovideo/download/video \
     -H "Content-Type: application/json" \
     -d '{"videoId":"sm12345678","quality":"high"}'
   
   # 進捗確認
   curl http://localhost:3001/api/nicovideo/download/status/job_xxx
   
   # SSE接続
   curl http://localhost:3001/api/nicovideo/download/progress/job_xxx/sse
   ```

## トラブルシューティング

### Playwrightがクラッシュする場合
- `PLAYWRIGHT_HEADLESS=false` でヘッドフルモード確認
- メモリ不足か確認
- `BROWSER_CONCURRENCY` を下げる

### S3アップロード失敗
- IAMキーの権限確認
- バケット名とリージョンが正しいか確認
- ネットワーク接続確認

### SSE接続が途中で切れる
- Redis接続状態確認
- プロキシ/ロードバランサーのタイムアウト設定確認
- クライアント側で再接続ロジック実装

## TODO

- [ ] コメントダウンロード機能（現在は基本枠のみ）
- [ ] ダウンロード履歴の DB 保存
- [ ] ダウンロード済みファイルのキャッシュ機能
- [ ] WebSocket 対応（SSEの代替）
- [ ] 動画品質の自動選択ロジック改善
