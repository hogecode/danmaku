# Google OAuth redirect_uri_mismatch エラー修正ガイド

## 🚨 現在のエラー

```
エラー: invalid_request
アクセスをブロック
このアプリのリクエストは無効です
```

このエラーは、Google Cloud Console に登録されたリダイレクト URI と、Backend が Google に送信するリダイレクト URI が一致していないために発生します。

---

## 📝 修正内容

### Backend 側の変更 (既に実施済み)

✅ **修正 1: `auth.service.ts`**
```diff
- const redirectUri = `${baseRedirectUri}?client=desktop`;
+ const redirectUri = baseRedirectUri;
```

✅ **修正 2: `auth.controller.ts`**
- クライアント判定をクエリパラメータから X-Client-Type ヘッダーに変更

---

## 🔧 あなたが実施すべき手順

### **ステップ 1: Google Cloud Console でリダイレクト URI を確認**

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 該当プロジェクトを選択
3. **APIs & Services** をクリック
4. **Credentials** をクリック
5. OAuth 2.0 Client ID を選択（Web application）
6. **Authorized redirect URIs** セクションを確認

### **ステップ 2: リダイレクト URI を追加/修正**

**現在の設定を確認:**
- ✅ `http://api.danmaku.cloud:3001/api/auth/callback`
- ✅ `http://localhost:3001/api/auth/callback`（開発環境の場合）

**削除すべき設定（存在する場合）:**
- ❌ `http://api.danmaku.cloud:3001/api/auth/callback?client=desktop`
- ❌ `http://localhost:3001/api/auth/callback?client=desktop`

### **ステップ 3: 修正内容を確認**

以下のいずれかで確認：

**A. GitHub で修正を確認:**
```bash
cd c:\Users\user\AppData\Local\app\danmaku
git log --oneline -n 5
git show HEAD  # 最新の修正内容
```

**B. ファイルの内容を直接確認:**
- `server/src/auth/services/auth.service.ts` の 75 行目
- `server/src/auth/auth.controller.ts` の 134-156 行目

### **ステップ 4: Backend を再起動**

```bash
cd c:\Users\user\AppData\Local\app\danmaku\server

# 実行中のサーバーを停止
# (Ctrl+C を押すか、別のターミナルから以下を実行)

# サーバーを再起動
yarn start

# または開発モード
yarn dev
```

### **ステップ 5: モバイルアプリで Google ログインをテスト**

1. モバイルアプリを起動
2. 「Googleログイン」ボタンをタップ
3. ブラウザが開き、Google のログイン画面が表示されるはず
4. Google ログインを完了
5. ブラウザが自動的に `danmaku://auth-callback` にリダイレクト
6. アプリが ホーム画面に遷移したら **成功！** ✅

---

## 🔍 トラブルシューティング

### Q1: まだ「このアプリのリクエストは無効です」エラーが出る

**A:** 以下をチェック:

1. **Google Cloud Console の設定を確認**
   - リダイレクト URI が正確に登録されているか
   - クエリパラメータ (`?client=desktop`) が付いていないか

2. **Backend が最新版か確認**
   ```bash
   cat c:\Users\user\AppData\Local\app\danmaku\server\src\auth\services\auth.service.ts | grep -A 3 "const redirectUri"
   ```
   → `const redirectUri = baseRedirectUri;` と表示されるはず

3. **キャッシュをクリア**
   - ブラウザキャッシュを削除
   - モバイルアプリキャッシュを削除

### Q2: Backend のログで何を確認すべき？

**A:** 以下のログを確認:

```
✅ [AUTH] Detected Flutter/Desktop client via X-Client-Type header
   → または
✅ [AUTH] Detected mobile user agent
   → または
✅ [AUTH] Detected Web client (default)
```

これらのいずれかが表示されれば、クライアント判定が正常に動作しています。

### Q3: `.env` の `GOOGLE_REDIRECT_URI` を変更すべき？

**A:** いいえ。以下のように設定したままにしてください：

```bash
GOOGLE_REDIRECT_URI=http://api.danmaku.cloud:3001/api/auth/callback
```

Backend が自動的にクエリパラメータなしで使用します。

---

## 📚 関連ドキュメント

- [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) - 詳細なセットアップガイド
- [DEEPLINK_OAUTH_GUIDE.md](./DEEPLINK_OAUTH_GUIDE.md) - ディープリンク認証フロー

---

## ✨ 修正に含まれるもの

- [x] `auth.service.ts` - リダイレクト URI からクエリパラメータを削除
- [x] `auth.controller.ts` - クライアント判定をヘッダーベースに変更
- [x] このガイドドキュメント

---

## 🎯 次のステップ

1. ✅ Backend のコードが修正されたか確認
2. ✅ Google Cloud Console でリダイレクト URI を修正
3. ✅ Backend を再起動
4. ✅ モバイルアプリで Google ログインをテスト
5. ✅ 成功を確認！

---

**質問がある場合は、このドキュメントの関連リンクを参照してください。**
