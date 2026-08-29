# Google OAuth Authentication Module

Google アカウントでのログイン機能を提供するモジュールです。OAuth 2.0 PKCE フローを採用し、セキュリティと利便性を両立させます。

## 特徴

- **OAuth 2.0 PKCE フロー**: RFC 7636 に準拠したセキュアな実装
- **セッション管理**: Redis ベースの分散セッション対応
- **トークン管理**: アクセストークン自動更新機能
- **Rate Limiting**: IP ベースのレート制限（1分間に5リクエスト）
- **セキュリティ**: HttpOnly Cookie、CSRF 対策、トークンリボーク

## セットアップ

### 1. 環境変数設定

`.env` ファイルに以下を追加してください:

```env
# Google OAuth
GOOGLE_OAUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://api.local/api/auth/callback
GOOGLE_SCOPES=openid,email,profile,https://www.googleapis.com/auth/drive.readonly

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-chars!

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Cookie
COOKIE_SECURE=false  # true in production
```

### 2. Google API コンソール設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新規プロジェクトを作成
3. OAuth 2.0 認可情報を作成
4. リダイレクト URI に `https://api.local/api/auth/callback` を追加
5. クライアント ID とシークレットを取得

## API エンドポイント

### ログイン開始

```
POST /api/auth/login
Content-Type: application/json

{
  "platform": "web"  // optional
}

Response 200:
{
  "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "abc123xyz789",
  "expires_in": 600
}
```

### OAuth コールバック

```
GET /api/auth/callback?code=4/0ABCDEF...&state=abc123xyz789

Response 302: Redirect to /home + session cookie
```

### ユーザー情報取得

```
GET /api/auth/me
Cookie: danmaku.sid=xxx

Response 200:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "picture_url": "https://...",
  "oauth_provider": "google",
  "last_login": "2026-08-29T10:00:00Z"
}
```

### トークン更新

```
POST /api/auth/refresh
Cookie: danmaku.sid=xxx

Response 200:
{
  "access_token": "ya29...",
  "expires_in": 3600
}
```

### ログアウト

```
POST /api/auth/logout
Cookie: danmaku.sid=xxx

Response 200:
{
  "message": "Logged out successfully"
}
```

## 認証フロー

```
1. ユーザーが Google ログインボタンをクリック
   ↓
2. フロントエンド: POST /api/auth/login
   ← レスポンス: authorize_url, state, expires_in
   ↓
3. フロントエンド: Google にリダイレクト (authorize_url)
   ↓
4. ユーザー: Google でアクセス許可
   ↓
5. Google: コード付きで redirect_uri にリダイレクト
   GET /api/auth/callback?code=xxx&state=yyy
   ↓
6. バックエンド:
   - state を検証（CSRF 対策）
   - code を token に交換
   - ユーザー情報を取得
   - DB に保存
   - セッション確立
   ↓
7. バックエンド: /home にリダイレクト (HttpOnly Cookie 付き)
```

## セキュリティ対策

### PKCE フロー (RFC 7636)
- code_verifier (128文字): クライアント側で生成
- code_challenge (SHA256): verifier からサーバーで検証
- 認可コード横取り攻撃を防止

### CSRF 対策
- state パラメータ: ランダムに生成して Redis 保存
- 有効期限: 10 分
- コールバック時に検証

### トークン管理
- アクセストークン: DB のみ保管（クライアント露出なし）
- リフレッシュトークン: 6 ヶ月有効期限
- 自動更新: 有効期限 5 分前に更新
- リボーク: ログアウト時に取り消し

### セッション Cookie
- HttpOnly: JavaScript からアクセス不可
- Secure: HTTPS でのみ送信
- SameSite=Strict: CSRF 攻撃対策
- MaxAge: 14 日

### Rate Limiting
- IP ベース: 1 分間に 5 リクエスト
- Redis で実装: 分散環境対応
- ローカル開発: 無視可能

## テスト

### ユニットテスト

```bash
yarn test
```

対象:
- PKCE 生成と検証
- トークン管理
- 認証ガード
- レート制限ガード

### E2E テスト

```bash
yarn test:e2e
```

対象:
- ログインフロー全体
- コールバック処理
- レート制限
- エラーハンドリング

## トラブルシューティング

### "Invalid or expired state parameter"
- state の有効期限切れ（10分以上経過）
- → ログインをやり直してください

### "Rate limit exceeded"
- 1 分間に 5 回以上のリクエスト
- → 数秒待ってから再試行してください

### "Failed to fetch Google user info"
- アクセストークンが無効
- → Google OAuth 設定を確認してください

### トークン自動更新が動作しない
- リフレッシュトークンが保存されていない
- → ログインをやり直してください

## 参考資料

- [RFC 7636 PKCE](https://tools.ietf.org/html/rfc7636)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Express Session](http://expressjs.com/en/resources/middleware/session.html)

## ライセンス

UNLICENSED
