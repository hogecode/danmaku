# React Native Deep Link OAuth 実装ガイド

## 概要

Flutter/Dart と同じフローで React Native に Deep Link + OAuth を実装しました。

Backend パラメータ形式: `danmaku://auth/callback?token=XXX&user=YYY`

---

## 実装フロー

```
1️⃣ ユーザーが「Google ログイン」ボタン押下
    ↓
2️⃣ POST /api/auth/login → OAuth URL 取得
    ↓
3️⃣ WebBrowser でブラウザを開く
    ↓
4️⃣ ユーザーが Google で認可
    ↓
5️⃣ Backend: GET /api/auth/callback?code=XXX&state=YYY
    ↓
6️⃣ Backend が User-Agent で React Native を判定
    ↓
7️⃣ Deep Link リダイレクト: danmaku://auth/callback?token=XXX&user=YYY
    ↓
8️⃣ React Native アプリが Deep Link を受信
    ↓
9️⃣ token + user を抽出・JSON パース
    ↓
🔟 TokenStorage + AuthStore に保存 → ホーム画面に遷移
```

---

## Backend パラメータ形式

`server/src/auth/auth.controller.ts` 行106:

```typescript
const deepLinkUrl = `danmaku://auth/callback?user=${encodeURIComponent(userData)}&token=${encodeURIComponent(accessToken)}`;
```

| パラメータ | 説明 |
|-----------|------|
| `token` | JWT アクセストークン |
| `user` | ユーザー情報（JSON エンコード） |

ユーザー情報オブジェクト:
```json
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://..."
}
```

---

## 実装内容

### ファイル: `apps/mobile/src/app/login.tsx`

#### 1️⃣ Deep Link リスナー

```typescript
const handleDeepLink = ({ url }: { url: string }) => {
  const parsed = Linking.parse(url);
  const { queryParams } = parsed;

  if (queryParams) {
    const token = queryParams.token as string | undefined;
    const userParam = queryParams.user as string | undefined;

    if (token && userParam) {
      const user = JSON.parse(userParam);
      auth.saveTokenAndSetUser(user, token).then(() => {
        router.replace('/');
      });
    }
  }
};
```

#### 2️⃣ 初期 URL チェック

```typescript
const checkInitialUrl = async () => {
  const initialUrl = await Linking.getInitialURL();
  if (initialUrl != null) {
    handleDeepLink({ url: initialUrl });
  }
};

checkInitialUrl();

const subscription = Linking.addEventListener('url', handleDeepLink);
return () => subscription.remove();
```

#### 3️⃣ WebBrowser 結果処理

```typescript
const result = await WebBrowser.openAuthSessionAsync(
  authorizeUrl,
  'danmaku://auth-callback'
);

if (result.type === 'success' && result.url) {
  const parsed = Linking.parse(result.url);
  const token = parsed.queryParams?.token;
  const userParam = parsed.queryParams?.user;

  if (token && userParam) {
    const user = JSON.parse(userParam);
    await auth.saveTokenAndSetUser(user, token);
    router.replace('/');
  }
}
```

---

## 期待される動作ログ

```
✅ [LoginScreen] OAuth URL 取得成功
✅ [LoginScreen] ブラウザセッション成功
✅ [LoginScreen] Redirect URL 受信: danmaku://auth/callback?token=...&user=...
✅ [LoginScreen] ユーザー情報パース成功: id=123, name=John Doe
✅ [useAuth] トークン保存完了
✅ [LoginScreen] ホーム画面に遷移
```

---

## 重要ポイント

### ✅ パラメータ名

- `token` (user_info ではない)
- `user` (user_info ではない)

### ✅ User-Agent 判定

Backend の `_isFlutterClient()`:

```typescript
const userAgent = request.get('user-agent') || '';
return userAgent.includes('ReactNative');
```

React Native は自動的に `ReactNative` を User-Agent に含む

---

## デバッグ

### iOS
```bash
xcrun simctl openurl booted \
  "danmaku://auth/callback?token=test&user=%7B%22id%22%3A%22123%22%7D"
```

### Android
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "danmaku://auth/callback?token=test&user=%7B%22id%22%3A%22123%22%7D"
```

---

## 統一性チェック

| 項目 | Flutter | React Native |
|------|---------|--------------|
| Deep Link | `danmaku://auth/callback` | ✅ 同一 |
| token パラメータ | ✅ | ✅ |
| user パラメータ | ✅ | ✅ |
| OpenAPI クライアント | ✅ Dart | ✅ TypeScript |

