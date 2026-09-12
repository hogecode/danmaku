# Database Schema - Danmaku Video Player

## 📊 テーブル一覧

| テーブル | 説明 | 主キー |
|---------|------|--------|
| `users` | ユーザー基本情報 | id |
| `local_auth` | 自前ログイン（メール+パスワード） | id |
| `auth_identities` | OAuth/ログイン用アカウント（プロバイダー別） | id |
| `drive_connections` | Drive接続（複数プロバイダ・複数アカウント対応） | id |
| `user_settings` | ユーザー個別設定 | id |
| `playback_history` | 視聴履歴 | id |

---

## 🔑 主要な設計ポイント

### 1. **認証の分離（新規）**

**auth_identities** (ログイン用)
- provider: 'google' / 'github' / 'password'
- トークン不保存（ID Token から情報取得）

**drive_connections** (Drive用、複数可)
- provider: 'google' / 'onedrive'
- access_token_encrypted: AES-256暗号化
- refresh_token_encrypted: AES-256暗号化
- scopes: JSON ["drive.readonly", ...]
- is_active: アクティブ状態

**重要**: ログイン用と Drive接続用は**完全に分離**

### 2. **複数Drive接続対応**

```
users (1) ←→ (N) drive_connections
```

例: user_id=1 が abc@gmail.com と xyz@gmail.com の Drive を接続可能

UNIQUE 制約: `UNIQUE(user_id, provider_name, provider_account_id)`

### 3. **トークン暗号化**

- DB保存: `access_token_encrypted`, `refresh_token_encrypted`
- 暗号化方式: AES-256-CBC（アプリ側）
- 鍵: `ENCRYPTION_KEY` 環境変数（64文字の16進数）
- IV: ランダム生成（暗号文に含める）

---

## 🚀 セットアップ

```bash
yarn install
# ENCRYPTION_KEY を .env に設定
docker-compose up -d postgres redis
yarn db:migrate
yarn start:dev
```

**Version**: 2.0 | **Updated**: 2026-09-12
