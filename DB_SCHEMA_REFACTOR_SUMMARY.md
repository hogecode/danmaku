# DB Schema Refactor Summary

## ✅ 完了した改修内容

### テーブル設計（auth.schema.ts）

**削除**: oauth_accounts テーブル全削除

**新規作成**:

#### auth_identities (ログイン用)
- Columns: id, user_id (FK), provider_name, provider_user_id, provider_email, is_primary
- トークン不保存（ID Token から情報取得）
- UNIQUE(user_id, provider_name)

#### drive_connections (Drive用、複数対応)
- Columns: id, user_id (FK), provider_name, provider_account_id, provider_account_email
- access_token_encrypted: AES-256暗号化
- refresh_token_encrypted: AES-256暗号化
- scopes: JSON
- is_active, last_accessed_at
- UNIQUE(user_id, provider_name, provider_account_id)

---

## トークン暗号化 Service

**ファイル**: server/src/common/encryption/

#### EncryptionService
- encrypt(plaintext): AES-256-CBC、ランダムIV生成
- decrypt(encrypted): 復号、平文返却

---

## Migration ファイル

**ファイル**: server/src/database/migrations/0005_auth_refactor.sql

- oauth_accounts削除
- auth_identities・drive_connections作成
- インデックス・外部キー設定

実行: yarn db:migrate

---

## Module 登録

**ファイル**: server/src/common/common.module.ts
- EncryptionModule追加・エクスポート

---

## 環境設定

**ファイル**: .env.example

ENCRYPTION_KEY=64-character-hex-string (32bytes)

生成: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

---

## 使用例

### ログイン Identity 取得
```typescript
const identity = await db.query.authIdentities.findFirst({
  where: and(
    eq(authIdentities.user_id, userId),
    eq(authIdentities.provider_name, 'google'),
  ),
});
// トークンなし
```

### Drive 接続作成
```typescript
await db.insert(driveConnections).values({
  user_id: 1,
  provider_name: 'google',
  provider_account_id: 'abc@gmail.com',
  access_token_encrypted: encryption.encrypt(token),
  refresh_token_encrypted: encryption.encrypt(refresh),
  scopes: JSON.stringify(['drive.readonly']),
  is_active: true,
});
```

### 全Drive接続取得
```typescript
const connections = await db.query.driveConnections.findMany({
  where: and(
    eq(driveConnections.user_id, userId),
    eq(driveConnections.is_active, true),
  ),
});
```

### 特定Driveのトークン取得
```typescript
const connection = await db.query.driveConnections.findFirst({
  where: and(
    eq(driveConnections.user_id, userId),
    eq(driveConnections.provider_account_id, 'xyz@gmail.com'),
  ),
});
const accessToken = encryption.decrypt(connection.access_token_encrypted);
```

---

## 設計の利点

- ✅ ログイン分離: Auth Identity はトークン不要
- ✅ 複数Drive: 1ユーザーが複数Google Driveアカウント接続可
- ✅ トークン暗号化: AES-256-CBCで安全に保存
- ✅ Scope管理: 権限情報を記録
- ✅ アクティブ管理: 接続の有効無効を管理

---

## 次のステップ（Phase 2, 3, 4）

### Phase 2: Backend Service改修
- AuthService: authIdentities対応
- DriveService: driveConnections・トークン暗号化対応
- PlayerService: connectionId対応

### Phase 3: API改修
- POST /auth/login → authIdentities記録
- POST /drive/connect → driveConnections記録（複数可）
- GET /drive/connections → 複数Drive一覧
- GET /player/stream/:connectionId/:fileId → connectionId特定

### Phase 4: Data Migration
- 既存oauth_accounts → auth_identities + drive_connections へ

---

## ファイル一覧

### 新規作成
- server/src/database/auth.schema.ts (oauth_accounts削除、新テーブル追加)
- server/src/common/encryption/encryption.service.ts
- server/src/common/encryption/encryption.module.ts
- server/src/common/encryption/index.ts
- server/src/database/migrations/0005_auth_refactor.sql
- DB_SCHEMA_REFACTOR_SUMMARY.md (このファイル)

### 改修
- server/src/common/common.module.ts
- server/.env.example
- server/src/database/DATABASE_SCHEMA.md
- server/src/database/migrations/meta/_journal.json

---

**Status**: ✅ DB Schema完全移行 | 次: Backend Service改修
**Updated**: 2026-09-12
