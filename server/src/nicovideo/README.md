# ニコ動ダウンロード API Module

ニコニコ動画の動画とコメントをダウンロードするための NestJS Module です。

## 機能

- ✅ ニコ動アカウント認証（セッション管理）
- ✅ 動画メタデータ取得
- ✅ 動画 URL 取得（DMS/DMC ストリーム対応）
- ✅ コメント取得（JSON 形式）
- ✅ Redis キャッシング
- ✅ PostgreSQL トークン永続化

## API エンドポイント

### ログイン

```
POST /api/nicovideo/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "ログインしました",
  "email": "user@example.com",
  "createdAt": 1234567890
}
```

### ログアウト

```
DELETE /api/nicovideo/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "ログアウトしました"
}
```

### 動画ダウンロード

```
POST /api/nicovideo/download/video
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "sm12345678",
  "quality": "high",
  "downloadComments": true
}

Response:
{
  "taskId": "uuid-string",
  "videoId": "sm12345678",
  "status": "completed",
  "message": "動画情報取得完了",
  "metadata": {
    "title": "動画タイトル",
    "duration": 300,
    "uploader": "投稿者名"
  },
  "createdAt": 1234567890
}
```

### コメントダウンロード

```
POST /api/nicovideo/download/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "sm12345678",
  "commentsLimit": 1000,
  "commentsFrom": 1234567890
}

Response:
{
  "taskId": "uuid-string",
  "videoId": "sm12345678",
  "status": "completed",
  "message": "コメント情報取得完了",
  "metadata": {
    "title": "動画タイトル",
    "commentCount": 5000
  },
  "createdAt": 1234567890
}
```

### ステータス確認

```
GET /api/nicovideo/status/:taskId
Authorization: Bearer <token>

Response:
{
  "status": "completed",
  "message": "ダウンロード完了"
}
```

## データベーススキーマ

### nicovideo_auth_tokens テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | bigint | プライマリキー |
| user_id | bigint | ユーザーID |
| email | varchar(255) | ニコ動メールアドレス |
| session_cookie | text | user_session クッキー |
| created_at | timestamp | 作成日時 |
| updated_at | timestamp | 更新日時 |

## マイグレーション

```bash
# スキーマ生成
npm run db:generate

# マイグレーション実行
npm run db:migrate
```

## 実装詳細

### ファイル構成

```
src/nicovideo/
├── nicovideo.controller.ts          # API エンドポイント
├── nicovideo.module.ts              # Module 定義
├── services/
│   ├── nicovideo-auth.service.ts    # 認証管理
│   ├── nicovideo-video.service.ts   # 動画処理
│   └── nicovideo-comment.service.ts # コメント処理
├── utils/
│   ├── nicovideo-api.client.ts      # API クライアント
│   ├── nicovideo-comment.fetcher.ts # コメント取得
│   └── nicovideo-video.downloader.ts # 動画 DL
├── dto/
│   ├── login-request.dto.ts
│   ├── download-video.dto.ts
│   └── download-comment.dto.ts
├── types/
│   └── nicovideo.types.ts           # 型定義
├── constants/
│   └── nicovideo.constants.ts       # 定数
└── database/
    └── nicovideo-token.schema.ts    # DB スキーマ
```

### 主要なクラス

#### NicovideApiClient
HTTP クライアントとセッション管理を担当

```typescript
const client = new NicovideApiClient();
await client.login('email@example.com', 'password');
client.setSessionCookie(cookie);
```

#### NicovideAuthService
トークン管理と認証ロジック

```typescript
// ログイン
await authService.login(userId, email, password);

// セッション確認
const cookie = await authService.getSessionCookie(userId);

// ログアウト
await authService.logout(userId);
```

#### NicovideVideoService
動画メタデータとダウンロード URL 取得

```typescript
// メタデータ取得
const metadata = await videoService.getVideoMetadata(userId, videoId);

// DL URL 取得
const { url, format } = await videoService.getVideoDownloadUrl(userId, videoId, 'high');
```

#### NicovideCommentFetcher
コメント取得ロジック

```typescript
// コメント取得
const comments = await fetcher.fetchComments(
  videoId,
  commentServer,
  threadKey,
  threads,
  language,
  commentsFrom,
  commentsLimit
);
```

## キャッシング

### Redis

- セッショントークン: 24 時間キャッシュ
- キー形式: `nicovideo:auth:{userId}`

### データベース

- トークンの永続化
- ユーザーごとのセッション情報

## エラーハンドリング

### 認証エラー

- `UnauthorizedException`: ログイン失敗
- セッション切れの場合は自動で再ログイン

### ビデオエラー

- `BadRequestException`: 削除動画、有料コンテンツなど
- DL 不可の場合はエラーメッセージ返却

### コメント取得エラー

- `TOO_MANY_REQUESTS`: レート制限中→リトライ
- `EXPIRED_TOKEN`: トークン切れ→キー更新

## 動作確認

### 1. ログイン

```bash
curl -X POST http://localhost:3001/api/nicovideo/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 2. 動画メタデータ取得

```bash
curl -X POST http://localhost:3001/api/nicovideo/download/video \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"sm12345678"}'
```

### 3. コメント取得

```bash
curl -X POST http://localhost:3001/api/nicovideo/download/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"sm12345678"}'
```

## 注意事項

⚠️ **本実装は簡略版です。以下の機能は未実装:**

1. **動画 DL のストリーム返却**: 現在は URL 取得のみ
2. **DMC ストリーム処理**: DMC の heartbeat 実装が不完全
3. **ファイル削除**: 一時ファイルの自動削除
4. **進捗通知**: WebSocket でのリアルタイム進捗送信
5. **複数フォーマット対応**: MP4 のみ対応

## 参考資料

- ニコ動公式 API: https://site.nicovideo.jp/
- DMS (Dwango Media Service) ドキュメント
- DMC (Dwango Media Cluster) ドキュメント

## ライセンス

UNLICENSED

## 作成日

2026-09-02
