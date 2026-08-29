# Database Schema - Danmaku Video Player

## 📊 テーブル一覧

| テーブル | 説明 | 主キー |
|---------|------|--------|
| `users` | ユーザー基本情報 | id |
| `local_auth` | 自前ログイン（メール+パスワード） | id |
| `oauth_providers` | OAuth プロバイダマスタ | id |
| `oauth_accounts` | ユーザーの OAuth アカウント（複数プロバイダ対応） | id |
| `tokens` | 認証トークン（access/refresh） | id |
| `user_sessions` | マルチデバイスログイン管理 | id |
| `user_settings` | ユーザー個別設定 | id |
| `screenshots` | スクリーンショット | id |
| `playlists` | プレイリスト | id |
| `playlist_items` | プレイリストアイテム | id |
| `favorites` | お気に入り | id |
| `playback_history` | 視聴履歴 | id |

---

## 🔑 主要な設計ポイント

### 1. **複数プロバイダ対応認証**
```
oauth_providers (マスタ) ←→ oauth_accounts (ユーザー)
  - Google, OneDrive, GitHub など
  - 1ユーザーが複数プロバイダでログイン可能
  - 例: user_id=1 の場合、Google と OneDrive 両方登録可
```

### 2. **マルチデバイス対応**
```
users (1) ←→ (N) user_sessions
  - device_type: 'web', 'ios', 'android'
  - 同時ログイン対応
```

### 3. **GDrive ファイルID 参照**
- `gdrive_file_id` は直接保存（テーブル分離なし）
- Redis でキャッシング（30秒 TTL）
- DB には永続化しない

### 4. **視聴履歴の効率性**
```sql
UNIQUE (user_id, gdrive_file_id)
```
- ユーザーごとに動画ID で一意
- 上書き更新時に効率的
- 「最近見た順」ソートに `watched_at` インデックス使用

---

## 🔐 セキュリティ

**暗号化必須フィールド**:
- `local_auth.password_hash` → bcryptjs
- `oauth_accounts.access_token` → AES-256
- `oauth_accounts.refresh_token` → AES-256
- `oauth_providers.client_secret` → AES-256

---

## ⚡ パフォーマンス最適化

**主要インデックス**:
- `users.email` → ログイン時検索
- `oauth_accounts (user_id, provider_id)` UNIQUE → 重複防止 + 検索
- `playback_history (user_id, gdrive_file_id)` UNIQUE → 上書き更新最適化
- `playback_history.watched_at` → ソート
- `user_sessions.last_activity` → アクティブセッション検索

---

## 🔄 キャッシング（Redis）

| キー | TTL | 用途 |
|------|-----|------|
| `oauth:provider:*` | 永続 | プロバイダ設定 |
| `gdrive:list:*` | 30秒 | フォルダ/ファイル一覧 |
| `user:settings:*` | 1時間 | ユーザー設定 |

---

## 📝 実装例

### OAuth ユーザー作成
```typescript
// 1. users に登録
// 2. oauth_accounts に接続情報登録
await db.insert(oauthAccounts).values({
  user_id: user.id,
  provider_id: googleProvider.id,
  provider_user_id: 'google123',
  access_token: encryptedToken,
  refresh_token: encryptedRefresh,
});
```

### マルチデバイスセッション
```typescript
// ログイン時
await db.insert(userSessions).values({
  user_id: user.id,
  token_id: token.id,
  device_type: 'web',
  device_name: 'Chrome on MacOS',
  ip_address: req.ip,
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
```

### 視聴履歴更新
```typescript
// 重複キー時は自動的に上書き
await db.insert(playbackHistory).values({
  user_id,
  gdrive_file_id,
  position_seconds: currentTime,
  is_completed: false,
}).onConflictDoUpdate({ 
  target: [playbackHistory.user_id, playbackHistory.gdrive_file_id],
  set: { position_seconds: currentTime }
});
```

---

## 🚀 セットアップ

```bash
# 1. パッケージインストール
yarn install

# 2. SQL マイグレーション生成
yarn db:generate

# 3. Docker で DB 起動
docker-compose up -d postgres redis

# 4. マイグレーション実行
yarn db:migrate

# 5. サーバー起動
yarn start:dev
```

---

**Version**: 1.0 | **Updated**: 2026-08-29
