# Flutter アプリケーション アーキテクチャ（シンプル版）

## 概要

**OpenAPI 自動生成を活用した最小限の層構成**

- ✅ **models/ フォルダ削除**（OpenAPI 生成モデル直接使用）
- ✅ Riverpod で State + Logic を一元管理
- ✅ OpenAPI 自動生成クライアント使用
- ✅ Service 層で API コール隔離

---

## 📁 ディレクトリ構成

```
lib/
├── providers/                 ← State + Logic（Riverpod）
│   ├── auth_provider.dart
│   ├── ui_provider.dart
│   └── router_provider.dart
│
├── pages/                     ← UI
│   ├── auth/
│   │   ├── login_page.dart
│   │   └── auth_callback_page.dart
│   ├── home_page_go.dart
│   └── ...
│
├── services/                  ← OpenAPI ラッパー
│   └── auth_service.dart
│
├── core/
│   ├── constants/
│   └── theme/
│
├── data/                      ← OpenAPI 自動生成
│   └── client/lib/
│       ├── api.dart           ← メインライブラリ
│       ├── api_client.dart
│       └── model/             ← 生成モデル
│
└── main.dart
```

---

## 🏗️ アーキテクチャの流れ

### **データフロー**

```
pages（UI）
    ↓
providers（Riverpod State）
    ↓
services（OpenAPI ラッパー）
    ↓
data/client/（OpenAPI 生成モデル）
```

### **具体例: ログイン**

```
1. LoginPage で「ログイン」ボタン押下
    ↓
2. ref.read(loginProvider.future) を call
    ↓
3. AuthService.login() を実行
    ↓
4. OpenAPI で POST /api/auth/login を呼び出し
    ↓
5. {authorize_url, state, expires_in} を返す
    ↓
6. LoginPage で loginResult['authorize_url'] でアクセス
    ↓
7. ブラウザで OAuth URL を開く
```

---

## 📖 各レイヤーの役割

### **data/client/（OpenAPI 自動生成）**

- **すべてのモデルが自動生成**
- `fromJson()` / `toJson()` は自動実装
- 手書きコード不要

```dart
import 'package:mobile/data/client/lib/api.dart';

// ログイン
final response = await authApi.authControllerLoginWithHttpInfo();
final data = response.data;  // {authorize_url, state, expires_in}

// ユーザー情報
final user = await authApi.authControllerGetUserInfoWithHttpInfo();
// {id, name, email, picture_url, ...}
```

### **providers/**

- **State（Riverpod）**
  - `StateProvider<dynamic>` - UI 状態
  - `Provider<AuthService>` - サービスインスタンス
  
- **Actions（FutureProvider）**
  - `FutureProvider<dynamic>` - 非同期処理

```dart
// State - OpenAPI 生成モデル使用（dynamic）
final currentUserProvider = StateProvider<dynamic>((ref) => null);
final isAuthenticatedProvider = StateProvider<bool>((ref) => false);

// Actions
final loginProvider = FutureProvider<dynamic>((ref) async {
  return await ref.watch(authServiceProvider).login();
});
```

### **services/**

- OpenAPI クライアント の初期化
- エラーハンドリング
- レスポンス検証

```dart
class AuthService {
  late final ApiClient _apiClient;
  late final AuthApi _authApi;
  
  AuthService() {
    _apiClient = ApiClient(basePath: 'http://localhost:3001');
    _apiClient.addDefaultHeader('X-Client-Type', 'flutter');
    _authApi = AuthApi(_apiClient);
  }
  
  Future<dynamic> login() async {
    final response = await _authApi.authControllerLoginWithHttpInfo();
    
    if (response.statusCode == null || response.statusCode! >= 400) {
      throw AuthException('Login failed', response.statusCode);
    }
    
    return response.data;
  }
}
```

### **pages/**

- UI 層
- Riverpod Provider を watch/read
- OpenAPI モデルは動的型で使用

```dart
class LoginPage extends ConsumerStatefulWidget {
  @override
  Widget build(BuildContext context) {
    final loading = ref.watch(authLoadingProvider);
    
    // ログイン
    final loginResult = await ref.read(loginProvider.future);
    
    // 動的アクセス
    final authorizeUrl = loginResult['authorize_url'];
  }
}
```

---

## 🎯 進化の過程

| 項目 | クリーンアーキテクチャ | MVVM（models 有） | **シンプル版** |
|------|-------------------|-------------|-------------|
| **レイヤー数** | 4-5 層 | 4 層 | **3 層** |
| **models/** | Entity/DTO 分離 | 統合 | **削除** |
| **モデル実装** | 手書き | 手書き | **生成** |
| **Repository パターン** | ✅ 必須 | ❌ 不要 | ❌ 不要 |
| **ファイル数** | 60+ | 40 | **25** |
| **型安全性** | 高い | 中程度 | **高い** |
| **シンプルさ** | 低い | 中程度 | **高い** |

---

## ✨ 簡潔版のメリット

| メリット | 詳細 |
|--------|------|
| **ファイル数が少ない** | models/ 削除で ~15 ファイル削減 |
| **保守性が高い** | OpenAPI 生成 → 仕様変更に自動対応 |
| **開発が高速** | モデルクラス不要、API 呼び出しのみ記述 |
| **型安全** | OpenAPI 生成で型チェック自動化 |
| **デバッグが簡単** | ファイル少 → 追跡が簡単 |

---

## ⚠️ 注意

### **型安全性について**

```dart
// dynamic を使用するため、IDE サポートが限定的
final user = loginResult['authorize_url'];  // 型推論なし

// その代わり、OpenAPI 生成が型チェックを保証
// API 仕様変更 → OpenAPI 再生成 → 自動対応
```

### **スケーリング時**

ビジネスロジックが増えた場合：

```dart
// Entity と DTO を分離
// Repository パターン導入
// Domain Layer 追加

// 元のクリーンアーキテクチャへの移行は簡単
```

---

## 📚 参考

- `lib/providers/auth_provider.dart` - State と FutureProvider の使い方
- `lib/pages/auth/login_page.dart` - OpenAPI モデルへのアクセス
- `lib/services/auth_service.dart` - OpenAPI クライアント初期化
