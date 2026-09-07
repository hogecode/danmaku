# Deep Link + OpenAPI クライアント統合 - 実装サマリー

## 🎯 実装目標

✅ **完了:** Flutter 版で OpenAPI 自動生成クライアント + Deep Link による自動リダイレクト

---

## 📊 実装フロー

```
1️⃣  ユーザーが「ログイン」ボタン押下
    ↓
2️⃣  POST /api/auth/login → OAuth URL + state 取得
    ↓
3️⃣  url_launcher でブラウザで Google OAuth を開く
    ↓
4️⃣  ユーザーが Google で認可
    ↓
5️⃣  GET /api/auth/callback?code=XXX&state=YYY へリダイレクト
    ↓
6️⃣  Server が User-Agent を判定:
    ├─ Flutter (Dart) → Deep Link: danmaku://auth/callback?code=XXX&state=YYY
    └─ Web → https://localhost:3000/home
    ↓
7️⃣  Deep Link で Flutter アプリに自動で戻る
    ↓
8️⃣  go_router が /auth/callback ルートをキャッチ
    ↓
9️⃣  OpenAPI クライアントで GET /api/auth/me を呼び出し
    ↓
🔟 ユーザー情報を Riverpod に保存 → ホーム画面に遷移
```


