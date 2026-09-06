# Deep Link + OpenAPI クライアント実装チェックリスト

## ✅ 完了したタスク

### Backend (server/)

- [x] `callback-response.dto.ts` を作成
- [x] `auth.controller.ts` を修正
  - [x] User-Agent 判定メソッド追加
  - [x] Flutter版: Deep Link リダイレクト
  - [x] Web版: 従来のリダイレクト維持
- [x] エラーハンドリング強化

### Frontend - Flutter (apps/mobile/)

- [x] `pubspec.yaml` に `openapi_generator_cli` を追加
- [x] `openapi-generator-config.yaml` を作成
- [x] `scripts/generate-api-client.sh` を作成
- [x] Deep Link 設定ファイル作成
  - [x] `android/app/src/main/AndroidManifest.xml` (Deep Link スキーマ設定)
  - [x] `ios/Runner/Info.plist` (Deep Link URL スキーム設定)
- [x] `router_provider.dart` 修正
  - [x] `/auth/callback` ルート追加
- [x] `deep_link_provider.dart` を作成（Riverpod プロバイダー）
- [x] `DEEP_LINK_IMPLEMENTATION.md` ドキュメント作成

### Frontend - Web (apps/web/)

- 変更なし（既に OpenAPI クライアント使用）

---

## 📋 次のタスク（実装待ち）

### 1️⃣ Backend: .env 設定

**ファイル:** `server/.env`

```env
MOBILE_CALLBACK_URL=danmaku://auth/callback
```

### 2️⃣ Flutter: OpenAPI クライアント生成

**実行コマンド:**

```bash
cd apps/mobile

# 1. OpenAPI クライアント生成
flutter pub run openapi_generator_cli generate \
  -i ../../server/openapi.yaml \
  -g dart \
  -c openapi-generator-config.yaml \
  -o lib/data/client

# 2. ビルド
dart run build_runner build
```

**確認:** `lib/data/client/` ディレクトリが生成される

### 3️⃣ Flutter: API クライアント プロバイダー作成

**ファイル:** `lib/data/repositories/api_client_provider.dart`

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:danmaku_api_client/api_client.dart';
import 'package:danmaku_api_client/api/auth_api.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    basePath: AppConstants.apiBaseUrl,
  );
});

final authApiProvider = Provider<AuthApi>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthApi(client);
});
```

### 4️⃣ Flutter: OAuth コールバック処理ページ作成

**ファイル:** `lib/presentation/pages/auth/auth_callback_page.dart`

実装内容:
1. URL パラメータから `code` と `state` を取得
2. OpenAPI クライアントで `/api/auth/me` を呼び出し
3. ユーザー情報を Riverpod に保存
4. ホーム画面に遷移

### 5️⃣ Flutter: login_page.dart 修正

現在の実装（url_launcher でブラウザ起動）は維持。
コールバックは自動で Deep Link ハンドリング。

### 6️⃣ テスト

ローカルテスト:

```bash
# Android
adb shell am start -W -a android.intent.action.VIEW \
  -d 'danmaku://auth/callback?code=test123&state=test456' \
  com.example.mobile

# iOS
xcrun simctl openurl booted 'danmaku://auth/callback?code=test123&state=test456'
```

---

## 🏗️ ファイル構成

```
apps/mobile/
├── lib/
│   ├── data/
│   │   ├── client/                    ← OpenAPI 生成ファイル（未生成）
│   │   │   └── lib/
│   │   ├── models/
│   │   ├── repositories/
│   │   │   └── api_client_provider.dart ← 次に作成
│   │   └── services/
│   │       └── auth_service.dart      ← 既存
│   ├── presentation/
│   │   ├── pages/
│   │   │   └── auth/
│   │   │       ├── login_page.dart    ← 既存
│   │   │       └── auth_callback_page.dart ← 次に作成
│   │   └── providers/
│   │       ├── auth_provider.dart     ← 既存
│   │       ├── deep_link_provider.dart ← 新規
│   │       └── router_provider.dart   ← 修正済み
│   └── ...
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml        ✅ 新規
├── ios/
│   └── Runner/
│       └── Info.plist                 ✅ 新規
├── openapi-generator-config.yaml      ✅ 新規
├── DEEP_LINK_IMPLEMENTATION.md        ✅ 新規
└── pubspec.yaml                       ✅ 修正
```

---

## 📚 参考リンク

- [OpenAPI Generator - Dart](https://openapi-generator.tech/docs/generators/dart/)
- [Flutter Deep Links](https://docs.flutter.dev/ui/navigation/deep-linking)
- [Go Router - Deep Linking](https://pub.dev/packages/go_router#deep-linking)
- [url_launcher](https://pub.dev/packages/url_launcher)

---

## 🔍 トラブルシューティング

### エラー: Deep Link が呼び出されない

原因: `AndroidManifest.xml` または `Info.plist` が正しく設定されていない

解決:
1. `android/app/src/main/AndroidManifest.xml` を確認
2. `ios/Runner/Info.plist` を確認
3. パッケージ名がアプリと一致しているか確認

### エラー: OpenAPI クライアント生成に失敗

原因: openapi.yaml が不完全またはバージョン不一致

解決:
```bash
# OpenAPI YAML の検証
cd server
npm install -g swagger-cli
swagger-cli validate openapi.yaml
```

### エラー: Deep Link のテストが失敗

原因: アプリが Deep Link スキーマを認識していない

解決:
```bash
# Android: adb で確認
adb shell cmd package resolve-activity --brief com.example.mobile

# iOS: xcrun で確認
xcrun simctl openurl booted 'danmaku://auth/callback?code=test&state=test'
```

---

## ✨ 次フェーズ（将来の改善）

1. **セッション永続化**
   - Secure Storage (flutter_secure_storage)
   - トークンの暗号化保存

2. **リフレッシュトークン**
   - 自動更新メカニズム
   - 有効期限管理

3. **エラーハンドリング**
   - OAuth エラーコード処理
   - ネットワーク再試行ロジック

4. **ユーザーテスト**
   - iOS/Android デバイステスト
   - ステージング環境テスト
