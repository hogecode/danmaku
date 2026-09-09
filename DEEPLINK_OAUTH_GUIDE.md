# Deep Link OAuth 認証フロー ガイド

## 概要

React Native / Expo モバイルアプリケーションにおける Google OAuth 認証と Deep Link リダイレクト の実装ガイドです。

---

## 問題と解決

### 問題
```
ブラウザセッション成功 
→ しかし Deep Link が受け取られない
```

### 原因
1. **Backend が Deep Link にリダイレクトしていない**
   - `/api/auth/callback` エンドポイントが `danmaku://auth-callback?token=...` にリダイレクトする必要がある
   
2. **WebBrowser から URL が返されていない**
   - `result.url` が null なので URL からトークンを抽出できない

### 解決

#### モバイル側（login.tsx）

✅ **修正内容**:

1. **WebBrowser の結果を処理**
```typescript
const result = await WebBrowser.openAuthSessionAsync(
  authorizeUrl,
  'danmaku://auth-callback'
);

if (result.type === 'success' && result.url) {
  // URL からトークンとユーザー情報を抽出
  const parsed = Linking.parse(result.url);
  const token = parsed.queryParams?.token;
  const userInfo = parsed.queryParams?.user_info;
  
  // トークン保存
  await auth.saveTokenAndSetUser(JSON.parse(userInfo), token);
}
```

2. **Deep Link リスナーの改善**
```typescript
useEffect(() => {
  // 初期 Deep Link チェック（アプリが Deep Link で起動した場合）
  const checkInitialUrl = async () => {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      handleDeepLink({ url: initialUrl });
    }
  };
  
  checkInitialUrl();
  
  // リスナー登録（後続の Deep Link）
  const subscription = Linking.addEventListener('url', handleDeepLink);
  return () => subscription.remove();
}, []);
```

#### Backend 側（必須の修正）

`GET /api/auth/callback` で以下の処理を実装してください：

```typescript
// 1. Google からコードとユーザー情報を取得
// 2. アプリケーショントークン（JWT）を生成
// 3. モバイルアプリへ Deep Link でリダイレクト

const token = generateJWT(user);
const userInfo = JSON.stringify({
  id: user.id,
  name: user.name,
  email: user.email,
  picture_url: user.picture
});

const encodedUserInfo = encodeURIComponent(userInfo);
const redirectUrl = `danmaku://auth-callback?token=${token}&user_info=${encodedUserInfo}`;

// HTTP 302 リダイレクト
res.redirect(302, redirectUrl);
```

---

## フロー図

```
モバイル                    ブラウザ                    Backend
  │                            │                           │
  │──[ログイン]──→             │                           │
  │                            │                           │
  │────────────── OAuth URL 取得 ──────────────────→ /api/auth/login
  │                            │←─ { authorizeUrl } ──│
  │                            │                       │
  │───[WebBrowser 開く]───→ Google OAuth ページ         │
  │     ↓                      │                       │
  │   ブラウザ待機              │────[ユーザー認可]────→│
  │                            │←─ code & state ─────│
  │                            │                       │
  │                            │ /api/auth/callback    │
  │                            │←─[トークン生成]───────│
  │                            │                       │
  │←──[Deep Link]──────────────│─ danmaku://...────────│
  │  ?token=xxx&user_info=yyy  │                       │
  │                            │                       │
  │──[TokenStorage 保存]       │                       │
  │  [ホーム画面に遷移]        │                       │
```

---

## チェックリスト

- [x] login.tsx: WebBrowser 結果処理の追加
- [x] login.tsx: Deep Link リスナーの改善（初期 URL チェック）
- [ ] **Backend: `/api/auth/callback` で Deep Link リダイレクト実装** ← 必須
- [ ] app.json: scheme が "danmaku" に設定されているか確認

---

## デバッグ用ログ確認

修正後のログ順序：

```
✅ [LoginScreen] ブラウザセッション成功
✅ [LoginScreen] Redirect URL 受信: danmaku://auth-callback?token=...
✅ [LoginScreen] クエリパラメータ: token=true, user_info=true
✅ [LoginScreen] トークン保存成功、ホーム画面に遷移
```

もし「Redirect URL 受信」が表示されない場合 → Backend をチェック

---

## テスト方法

```bash
# ターミナルで Deep Link をシミュレート（iOS）
xcrun simctl openurl booted "danmaku://auth-callback?token=test&user_info=%7B%22id%22%3A%221%22%7D"

# または Android
adb shell am start -W -a android.intent.action.VIEW \
  -d "danmaku://auth-callback?token=test&user_info=%7B%22id%22%3A%221%22%7D"
```

