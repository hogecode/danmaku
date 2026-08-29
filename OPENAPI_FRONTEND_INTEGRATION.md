# 🔌 フロントエンド OpenAPI クライアント統合 - 完全ガイド

## 📝 概要

フロント側のコードをOpenAPI自動生成クライアントを使ってAPIコールするように修正しました。

### ✅ 修正内容

1. **`lib/api-client.ts` を新規作成** - OpenAPI生成クライアントをラップ
2. **`hooks/useAuth.ts` を修正** - OpenAPI生成型を使用
3. **認証エラーを解決** - `useAuthContext`の型エラーを完全解決

---

## 🔧 修正ファイル詳細

### 1️⃣ **新規作成: `apps/web/lib/api-client.ts`**

OpenAPI生成クライアント（AuthApi）をラップしたAPIクライアントを作成しました。

**主な機能:**
```typescript
// ログイン開始
async login(): Promise<LoginResponseDto>

// ユーザー情報取得
async getUserInfo(): Promise<UserInfoDto>

// ログアウト
async logout(): Promise<void>

// トークン更新
async refreshToken(): Promise<any>

// OAuthコールバック処理
async handleOAuthCallback(code: string, state: string): Promise<UserInfoDto>
```

**特徴:**
- ✅ OpenAPI生成型（UserInfoDto、LoginResponseDto）を使用
- ✅ Axios AxiosPromise から `.data` を自動抽出
- ✅ クレデンシャル（credentials）を有効化
- ✅ エラーハンドリング実装

---

### 2️⃣ **修正: `apps/web/hooks/useAuth.ts`**

OpenAPI生成型を使用するように修正しました。

**変更点:**
```diff
- apiClient.get<UserInfo>('/auth/me')
+ apiClient.getUserInfo()

- apiClient.post<LoginResponse>('/auth/login')
+ apiClient.login()
```

**型の変更:**
```typescript
export type UserInfo = UserInfoDto;
export type LoginResponse = LoginResponseDto;
```

---

## 🏗️ アーキテクチャ

```
React コンポーネント
  ↓
useAuth Hook (useAuth.ts)
  ↓
ApiClient (api-client.ts)
  ↓
OpenAPI 生成クライアント (AuthApi)
  ↓
Axios HTTP Client
  ↓
NestJS Backend API
```

---

## 📋 修正箇所一覧

| ファイル | 修正内容 |
|---------|---------|
| `apps/web/lib/api-client.ts` | 🆕 新規作成 |
| `apps/web/hooks/useAuth.ts` | 修正 |

---

## 🚀 動作確認

1. ブラウザで http://localhost:3000 にアクセス
2. ログイン画面が表示される
3. Google でログイン をクリック
4. Google OAuth へリダイレクト
5. ログイン後、ホーム画面へリダイレクト

---

## ✨ メリット

✅ **型安全性** - OpenAPI生成型で保証
✅ **保守性** - APIロジックの一元管理
✅ **拡張性** - 新APIの追加が容易
✅ **エラー対応** - useAuthContext の型エラー完全解決
