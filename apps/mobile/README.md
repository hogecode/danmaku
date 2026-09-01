# Flutter DPlayer - ダンマク動画プレイヤー

Flutter ベースのダンマク動画プレイヤー実装

## 🎯 プロジェクト概要

本プロジェクトは、web 上の DPlayer (TypeScript) を Flutter で再実装したモバイル向けダンマク動画プレイヤーです。

### 主な機能

- ✅ **MP4 動画再生** - video_player による標準ビデオ再生
- ✅ **ダンマク表示** - CustomPaint による Canvas ベース描画
- ✅ **再生制御** - 再生/停止/シーク/音量調整
- ✅ **画質切り替え** - 複数の URL サポート
- ✅ **API 連携** - NestJS バックエンド との連携
- ✅ **設定機能** - 再生速度・ダンマク速度・不透明度調整
- ✅ **多言語対応** - 日本語・英語

## 🏗️ プロジェクト構成

```
lib/
├── core/                    # コア層（定数・設定・拡張）
├── data/                    # データ層（モデル・API・ストレージ）
├── domain/                  # ドメイン層（Entity・UseCase）
├── presentation/            # プレゼンテーション層（UI・Providers）
└── main.dart               # エントリーポイント
```

## 📦 依存パッケージ

```yaml
video_player: ^2.11.0       # ビデオ再生
flutter_riverpod: ^2.5.0    # 状態管理
dio: ^5.4.0                 # HTTP通信
retrofit: ^4.1.0            # API クライアント生成
hive: ^2.2.0                # ローカルキャッシング
intl: ^0.19.0               # 多言語対応
logger: ^2.4.0              # ロギング
```

## 🚀 セットアップ

### 1. 依存パッケージをインストール

```bash
flutter pub get
```

### 2. コード生成（json_serializable, retrofit, hive）

```bash
flutter pub run build_runner build
```

### 3. アプリを実行

```bash
flutter run
```

## 📖 ドキュメント

詳細なドキュメントは `docs/` フォルダを参照してください。

| ファイル | 内容 |
|---------|------|
| [docs/README.md](../mobile/docs/README.md) | ドキュメント索引 |
| [docs/00_PROJECT_OVERVIEW.md](../mobile/docs/00_PROJECT_OVERVIEW.md) | プロジェクト概要 |
| [docs/01_ARCHITECTURE.md](../mobile/docs/01_ARCHITECTURE.md) | アーキテクチャ設計 |
| [docs/02_MODELS_SCHEMA.md](../mobile/docs/02_MODELS_SCHEMA.md) | データモデル仕様 |
| [docs/03_API_SPECIFICATION.md](../mobile/docs/03_API_SPECIFICATION.md) | API 仕様 |
| [docs/04_UI_SPECIFICATIONS.md](../mobile/docs/04_UI_SPECIFICATIONS.md) | UI/UX 仕様 |
| [docs/05_DANMAKU_ENGINE.md](../mobile/docs/05_DANMAKU_ENGINE.md) | ダンマク描画エンジン |
| [docs/06_IMPLEMENTATION_GUIDE.md](../mobile/docs/06_IMPLEMENTATION_GUIDE.md) | 実装ガイド |

## 🧪 テスト

```bash
# ユニットテスト
flutter test

# カバレッジ
flutter test --coverage

# 特定のテストファイルを実行
flutter test test/unit/models/danmaku_model_test.dart
```

## 📊 コード品質

```bash
# Lint チェック
flutter analyze

# フォーマット
dart format lib/

# フォーマット適用
dart format --write lib/
```

## 🔨 ビルド

### iOS

```bash
flutter build ios --release
```

### Android

```bash
flutter build apk --release
flutter build appbundle --release
```

## 🏗️ 実装フェーズ

### Phase 1: ✅ 基盤構築（完了）
- Flutter プロジェクト初期化
- Core・Data・Domain・Presentation レイヤー実装
- 基本プレイヤー UI（ダンマク無し）

### Phase 2: ⏳ ダンマク描画エンジン（実装予定）
- CustomPaint Canvas 実装
- 複数軌道（right/top/bottom）管理
- コリジョン検出・回避
- パフォーマンス最適化

### Phase 3: ⏳ UI/コントローラー（実装予定）
- コントローラーバー完成
- 設定パネル実装
- 多言語対応

### Phase 4: ⏳ API 連携・テスト（実装予定）
- API 統合テスト
- ユニット・統合テスト実装

## 🎓 アーキテクチャ

Clean Architecture + Riverpod 状態管理

```
Presentation Layer (UI・Widgets・Providers)
        ↓
Domain Layer (Entities・UseCases)
        ↓
Data Layer (Repositories・Models・Services)
        ↓
External Services (API・Storage)
```

## 🌐 API 連携

### ダンマク取得

```
GET /api/danmaku?video_id=xxx
```

**レスポンス例**

```json
{
  "code": 0,
  "data": [
    [0, "right", "#ffeaea", "Author", "テキスト", "medium"],
    [5, "top", "#ff0000", "User", "テキスト", "big"]
  ]
}
```

詳細: [docs/03_API_SPECIFICATION.md](../mobile/docs/03_API_SPECIFICATION.md)

## ⚙️ 設定

### API ベース URL

`lib/core/constants/app_constants.dart` を編集：

```dart
static const String apiBaseUrl = 'http://api.danmaku.local';
```

### ダンマク設定

```dart
static const int maxDanmakuCount = 1000;           // 最大表示数
static const double danmakuDurationSeconds = 8.0;  // 表示時間
static const double danmakuSpeedRate = 1.0;        // 速度倍率
```

## 🐛 よくある問題

### API に接続できない

1. **API サーバーが起動しているか確認**
   ```bash
   curl http://api.danmaku.local/api/danmaku
   ```

2. **ベース URL を確認**
   - `lib/core/constants/app_constants.dart` の `apiBaseUrl`

3. **ロガーで詳細確認**
   - ビデオプレイヤー起動時のコンソールログを確認

### ビルドエラー

コード生成を再実行：

```bash
flutter pub run build_runner clean
flutter pub run build_runner build
```

## 📞 サポート

質問や問題がある場合は、以下を参照してください：

- [docs/06_IMPLEMENTATION_GUIDE.md](../mobile/docs/06_IMPLEMENTATION_GUIDE.md) - よくある問題と対処法
- [docs/README.md](../mobile/docs/README.md) - ドキュメント索引

## 📝 ライセンス

MIT License

## 👨‍💻 開発者

- **Created by**: Cline (AI Coding Agent)
- **Project Version**: 1.0.0
- **Created**: 2026年8月30日

---

**Happy Coding! 🚀**
