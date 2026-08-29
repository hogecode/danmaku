# [AUTH-001] Google OAuth ログイン - 詳細設計書

**機能ID**: AUTH-001 | **バージョン**: 1.0 | **作成日**: 2026-08-29 | **ステータス**: ✅

---

## 1. 概要

### 1.1 機能説明

ユーザーが Google アカウントでアプリケーションに認証し、Google Drive API へのアクセス権限を取得します。OAuth 2.0 PKCE フローを採用し、セキュリティと利便性を両立させます。

### 1.2 関連要件

- [AUTH-001] Google OAuth ログイン（本要件）
- [AUTH-002] Google OAuth ログアウト
- [AUTH-003] トークン管理（自動更新）
- [AUTH-004] 通常ログイン

### 1.3 設計方針

| 方針 | 内容 | 理由 |
|-----|------|------|
| 認証フロー | OAuth 2.0 PKCE | セキュリティ、モバイル対応 |
| トークン保管 | サーバー側のみ | クライアント露出リスク低減 |
| スコープ | drive.readonly + userinfo | 必要最小限 |
| ユーザーID | メールアドレス | 一意性保証 |

---

## 2. システムフロー

### 2.1 全体フロー図

```
ユーザー    クライアント      NestJS        Google
  │            │               │              │
  │─Google─→   │               │              │
  │  Login      │─/auth/login→  │              │
  │           ←─authorize_url───│              │
  │           │─Redirect──────────────────→  │
  │           │       ┌────────────────────→
  │◄──Consent─┴───────│─────────────────────→
  │  Screen            │                     │
  │─Allow───→ │◄──Redirect+Code─────────── │
  │           │                             │
  │           │─/auth/callback────→        │
  │           │  ?code=xxx&state=y          │
  │           │      ←SessionID             │
  │◄──Redirect                              │
  │  /home                                   │
```

### 2.2 詳細フェーズ

**Phase 1**: ログイン開始 → `POST /api/auth/login` → PKCE生成、state保存  
**Phase 2**: Google認可 → ユーザーがアクセス許可  
**Phase 3**: コード交換 → `GET /api/auth/callback` → token交換  
**Phase 4**: セッション確立 → ユーザー登録、Cookie設定  

---

## 3. 技術仕様

### 3.1 PKCE実装（RFC 7636）

```typescript
// code_verifier + code_challenge 生成
const generatePKCE = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const verifier = Array(128).fill(0).map(() => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  const challenge = base64UrlEncode(sha256(verifier));
  return { verifier, challenge };
};

// State検証（CSRF対策）
const validateState = (sessionState, receivedState) => {
  if (sessionState !== receivedState) throw new Error('CSRF');
};
```

### 3.2 トークン管理

| トークン | 有効期限 | 保管 | 用途 |
|---------|--------|------|------|
| Access Token | 1h | DB | GDrive API |
| Refresh Token | 6m | DB | 更新用 |
| Session Cookie | 14d | HttpOnly | 認証 |

**自動更新** (5分前):
```typescript
if (expiresAt - now < 5*60*1000) {
  await refreshAccessToken(oauthAccount);
}
```

### 3.3 Google OAuth スコープ

```
drive.readonly        // GDrive読み取り
userinfo.email        // メール取得
userinfo.profile      // プロフ取得
```

### 3.4 セキュリティ対策

- HTTPS必須（Google OAuth要件）
- CSRF対策：State パラメータ検証
- Token管理：サーバーDB のみ保管
- 入力検証：authCode/state の形式チェック
- Rate Limit：1分に5回以上を拒否
- Cookie設定：HttpOnly, Secure, SameSite=Strict

---

## 4. API仕様

### 4.1 ログイン開始: `POST /api/auth/login`

```
Request: { "platform": "web" | "mobile" }

Response 200:
{
  "authorize_url": "https://accounts.google.com/...",
  "state": "abc123xyz789",
  "expires_in": 600
}

Error 400/429/500
```

### 4.2 OAuth コールバック: `GET /api/auth/callback`

```
Query: ?code=4/0ABCDEF...&state=abc123xyz789

Response 302: Redirect to /home + session cookie

Error 403: CSRF verification failed
```

### 4.3 トークン更新: `POST /api/auth/refresh`

```
Response 200: { "access_token": "ya29...", "expires_in": 3600 }

Error 401: Refresh token expired
```

### 4.4 ユーザー情報: `GET /api/auth/me`

```
Response 200:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "picture_url": "https://...",
  "oauth_provider": "google"
}

Error 401: Not authenticated
```

---

## 5. データモデル

### 5.1 Users テーブル

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture_url VARCHAR(512),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
```

### 5.2 OAuth Accounts テーブル

```sql
CREATE TABLE oauth_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGSERIAL NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL,  -- 'google'
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_name, provider_user_id)
);
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
```

---

## 6. UI/UX設計

### 6.1 ログイン画面

```
┌──────────────────────────┐
│  Danmaku Video Player    │
│                          │
│  ┌───────────────────┐  │
│  │ Google でログイン │  │
│  └───────────────────┘  │
│                          │
│  ユーザー名: ________   │
│  パスワード: ________   │
│  ┌───────────────────┐  │
│  │    ログイン        │  │
│  └───────────────────┘  │
│                          │
└──────────────────────────┘
```

### 6.2 エラー画面

- CSRF Error: ⚠️ セキュリティエラー
- Network Error: ❌ 接続エラー
- Google Denied: ℹ️ アクセス拒否

---

## 7. チェックリスト

- [ ] PKCE code_verifier: 43-128文字
- [ ] State: セッション保存
- [ ] Token: DB のみ保管
- [ ] HTTPS: 開発環境対応
- [ ] Cookie: HttpOnly設定
- [ ] Rate Limit: 実装
- [ ] 入力検証: 実装

---

## 8. テスト

**単体**:
```typescript
it('PKCE生成', () => {
  const {verifier} = service.generatePKCE();
  expect(verifier.length).toBeBetween(43, 128);
});

it('State検証', () => {
  expect(() => service.validateState('a','a')).not.toThrow();
  expect(() => service.validateState('a','b')).toThrow();
});
```

**セキュリティ**:
- CSRF: 異なるstate → 403
- Code横取り → 400
- Token露出: HttpOnly のみ

---

## 9. 参考資料

- RFC 7636 PKCE: https://tools.ietf.org/html/rfc7636
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- NestJS Auth: https://docs.nestjs.com/security/authentication

---

**文書ID**: AUTH-001-DESIGN-001 | **完成**: 2026-08-29
