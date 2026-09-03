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
Content-Type: application/json

{
  "videoId": "sm12345678",
  "quality": "auto"
}

Response (即座に返却):
{
  "taskId": "uuid-string",
  "videoId": "sm12345678",
  "status": "pending",
  "message": "ダウンロード開始しました。taskId で進捗確認が可能です",
  "metadata": {
    "title": "動画タイトル",
    "duration": 300,
    "uploader": "投稿者名",
    "commentCount": 5000
  },
  "createdAt": 1234567890
}

Note:
- ダウンロード処理はバックグラウンドで非同期実行
- ファイルは downloads/{videoId}/{videoId} - {title}.mp4 に保存
- quality: "high" | "low" | "auto" (デフォルト: "auto")
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
動画メタデータとダウンロード処理

```typescript
// メタデータ取得
const metadata = await videoService.getVideoMetadata(videoId);

// ダウンロード開始（バックグラウンド非同期実行）
await videoService.downloadVideoMedia(taskId, videoId, metadata, 'auto');

// メソッド一覧:
// - getVideoMetadata(videoId) → NicovideVideoMetadata
//   - ログインなしで公開動画情報取得可能
// - downloadVideoMedia(taskId, videoId, metadata, quality)
//   - 動画ファイルをダウンロードしてローカルに保存
// - extractDMSUrl() / extractDMCUrl()
//   - DMS/DMC ストリーム URL の抽出
// - downloadFile(url, filepath, taskId)
//   - HTTP(S) ダウンロードとファイル保存
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

## 実装内容（2026-09-02 更新）

✅ **実装済み機能:**

1. **動画メディアのダウンロード**
   - DMS (Dwango Media Service) ストリーム対応
   - DMC (Dwango Media Cluster) セッション対応
   - リダイレクト自動処理
   - 進捗ログ出力

2. **バックグラウンド処理**
   - 非同期実行（Promise ベース）
   - タスク ID でトラッキング可能
   - エラーハンドリング実装

3. **ローカルストレージ**
   - `downloads/{videoId}/{title}.mp4` に保存
   - `.part` ファイルでの一時保存
   - ファイル名サニタイズ（パストトラバーサル対策）

4. **品質選択**
   - `quality` パラメータ: "high" | "low" | "auto"
   - DMS/DMC から利用可能な品質を自動選択

## 注意事項

⚠️ **未実装/今後改善予定:**

1. **Redis キャッシング**: タスク状態の永続化（現在はメモリのみ）
2. **DMC Heartbeat**: DMC セッション保持（現在は簡略版）
3. **マルチスレッドダウンロード**: 単一接続のみ対応
4. **進捗通知**: WebSocket/Server-Sent Events での通知
5. **レジューム**: 中断後の再開（現在は新規ダウンロード）
6. **複数フォーマット**: MP4 のみ対応（M4A/M4V/TS は未実装）

## 参考資料

- ニコ動公式 API: https://site.nicovideo.jp/
- DMS (Dwango Media Service) ドキュメント
- DMC (Dwango Media Cluster) ドキュメント

## ライセンス

UNLICENSED

## 作成日

2026-09-02
