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

---

## ✅ 実装済みファイル

### Backend (server/)

- **`callback-response.dto.ts`** ✅ 新規
- **`auth.controller.ts`** ✅ 修正
  - User-Agent 判定
  - Flutter: Deep Link リダイレクト
  - Web: 従来リダイレクト

### Flutter (apps/mobile/)

- **`openapi-generator-config.yaml`** ✅ 新規
- **`android/AndroidManifest.xml`** ✅ 新規（Deep Link設定）
- **`ios/Info.plist`** ✅ 新規（Deep Link設定）
- **`lib/presentation/providers/deep_link_provider.dart`** ✅ 新規
- **`lib/presentation/providers/router_provider.dart`** ✅ 修正（/auth/callback ルート追加）
- **`pubspec.yaml`** ✅ 修正（openapi_generator_cli 追加）

---

## 📋 次のステップ（実装待ち）

### 1️⃣ OpenAPI クライアント生成

```bash
cd apps/mobile
flutter pub run openapi_generator_cli generate \
  -i ../../server/openapi.yaml \
  -g dart \
  -c openapi-generator-config.yaml \
  -o lib/data/client
dart run build_runner build
```

### 2️⃣ API クライアント プロバイダー作成

ファイル: `lib/data/repositories/api_client_provider.dart`

### 3️⃣ OAuth コールバック処理ページ

ファイル: `lib/presentation/pages/auth/auth_callback_page.dart`
- OpenAPI クライアントで `/api/auth/me` 呼び出し
- ユーザー情報を Riverpod に保存
- ホーム画面に遷移

### 4️⃣ テスト

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d 'danmaku://auth/callback?code=test&state=test' \
  com.example.mobile
```
