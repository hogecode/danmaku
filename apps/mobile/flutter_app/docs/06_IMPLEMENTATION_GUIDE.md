# Flutter DPlayer - 実装ガイド

---

## 🚀 実装開始前のチェックリスト

- [ ] Flutter 3.24+ がインストール済み
- [ ] Dart 3.5+ がセットアップ済み
- [ ] VS Code / Android Studio がセットアップ済み
- [ ] iOS SDK / Android SDK 準備完了
- [ ] API サーバー（NestJS）が起動中

---

## 📦 初期セットアップ

### 1. プロジェクト初期化

```bash
cd apps/mobile
flutter create --org com.danmaku flutter_app
cd flutter_app
```

### 2. pubspec.yaml 設定

```yaml
name: flutter_app
description: Danmaku Video Player for Flutter

environment:
  sdk: '>=3.5.0 <4.0.0'
  flutter: '>=3.24.0'

dependencies:
  flutter:
    sdk: flutter
  
  # Video & Playback
  video_player: ^2.11.0
  
  # State Management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.5.0
  
  # API Client
  dio: ^5.4.0
  retrofit: ^4.1.0
  json_annotation: ^4.8.0
  
  # Localization
  intl: ^0.19.0
  
  # Storage
  hive: ^2.2.0
  hive_flutter: ^1.1.0
  
  # Logging
  logger: ^2.4.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.0
  retrofit_generator: ^7.1.0
  json_serializable: ^6.8.0
  hive_generator: ^2.0.0
  riverpod_generator: ^2.5.0
```

### 3. 依存パッケージ取得

```bash
flutter pub get
```

---

## 🏗️ ディレクトリ構造作成

```bash
mkdir -p lib/{core/{constants,config,extensions,utils},data/{datasources,models,repositories,services},domain/{entities,usecases},presentation/{providers,notifiers,pages,widgets/{dplayer,video_view,danmaku,controller_bar,settings,common}}}
mkdir -p test/{unit,integration}
```

---

## 📝 実装順序（Phase 1-4）

### Phase 1: 基盤構築（3-4 日）

**1-1. Core レイヤー**

- [ ] `core/constants/app_constants.dart` - アプリ定数
- [ ] `core/constants/color_constants.dart` - カラーパレット
- [ ] `core/config/api_config.dart` - API 設定
- [ ] `core/extensions/*.dart` - 拡張メソッド

**1-2. Data レイヤー**

- [ ] `data/models/danmaku_model.dart` - JSON シリアライズ対応
- [ ] `data/models/api_response_model.dart`
- [ ] `data/services/api_service.dart` - Dio + Retrofit
- [ ] `data/services/storage_service.dart` - Hive

**1-3. Domain レイヤー**

- [ ] `domain/entities/danmaku_entity.dart`
- [ ] `domain/usecases/fetch_danmaku_usecase.dart`

**1-4. Presentation - State Management**

- [ ] `presentation/providers/app_provider.dart` (Riverpod 設定)
- [ ] `presentation/notifiers/player_notifier.dart`
- [ ] `presentation/notifiers/danmaku_notifier.dart`

**1-5. UI - 基本ウィジェット**

- [ ] `presentation/pages/player_page.dart`
- [ ] `presentation/widgets/video_view/video_view.dart`
- [ ] `presentation/widgets/controller_bar/controller_bar.dart`

**成果物**: 基本プレイヤー（ダンマク無し）で MP4 再生可能

---

### Phase 2: ダンマク描画エンジン（5-7 日）

**2-1. Danmaku Service**

- [ ] `presentation/widgets/danmaku/danmaku_engine.dart` - コア計算
- [ ] `presentation/widgets/danmaku/danmaku_particle.dart` - 粒子管理
- [ ] `presentation/widgets/danmaku/collision_detector.dart` - 衝突検出

**2-2. Canvas 描画**

- [ ] `presentation/widgets/danmaku/danmaku_canvas.dart` - CustomPaint
- [ ] `presentation/notifiers/danmaku_notifier.dart` 拡張

**2-3. パフォーマンス最適化**

- [ ] オブジェクトプール実装
- [ ] TextPainter キャッシング
- [ ] RepaintBoundary 最適化
- [ ] フレームレート計測

**成果物**: ダンマク完全描画・60fps フレームレート

---

### Phase 3: UI/コントローラー（2-3 日）

**3-1. コントローラーバー**

- [ ] `presentation/widgets/controller_bar/progress_bar.dart`
- [ ] `presentation/widgets/controller_bar/time_display.dart`
- [ ] ボタン・スライダー実装

**3-2. 設定パネル**

- [ ] `presentation/widgets/settings/settings_panel.dart`
- [ ] `presentation/widgets/settings/speed_selector.dart`
- [ ] `presentation/widgets/settings/danmaku_settings.dart`

**3-3. 多言語対応**

- [ ] `core/utils/localization.dart`
- [ ] 翻訳ファイル作成

**成果物**: 完全なプレイヤー UI

---

### Phase 4: API 連携・テスト（1-2 日）

**4-1. API 統合**

- [ ] API サーバー連携確認
- [ ] エラーハンドリング実装
- [ ] リトライロジック

**4-2. テスト**

- [ ] `test/unit/models/*_test.dart`
- [ ] `test/unit/services/*_test.dart`
- [ ] `test/integration/player_integration_test.dart`

**成果物**: 本番環境対応

---

## 🧪 テスト実行

```bash
# ユニットテスト
flutter test

# カバレッジ
flutter test --coverage

# 特定ファイルのテスト
flutter test test/unit/models/danmaku_model_test.dart
```

---

## 🔨 ビルド・デプロイ

### iOS

```bash
flutter build ios --release
# Xcode で署名・ビルド
```

### Android

```bash
flutter build apk --release
flutter build appbundle --release
```

---

## 📊 コード品質チェック

```bash
# Lint チェック
flutter analyze

# Format チェック
dart format lib/

# Format 適用
dart format --write lib/
```

---

## 🔍 よくある問題と対処

### 1. API 接続エラー

**症状**: `API連携失敗`

**対処**:
```dart
// 環境設定確認
print(ApiConfig.baseUrl);

// デバッグログ有効化
logger.level = Level.debug;
```

### 2. ダンマク描画が遅い

**症状**: フレームドロップ

**対処**:
- テキストキャッシュ確認
- 粒子数を制限
- RepaintBoundary 活用

### 3. メモリリーク

**症状**: アプリがクラッシュ

**対処**:
- Riverpod のメモリリーク確認
- VideoPlayerController のクリーンアップ
- Listener の削除

---

## 📚 参考資料

| ファイル | 内容 |
|---------|------|
| 00_PROJECT_OVERVIEW.md | プロジェクト概要 |
| 01_ARCHITECTURE.md | アーキテクチャ |
| 02_MODELS_SCHEMA.md | データモデル |
| 03_API_SPECIFICATION.md | API 仕様 |
| 04_UI_SPECIFICATIONS.md | UI/UX 仕様 |
| 05_DANMAKU_ENGINE.md | ダンマク描画エンジン |

---

**開始**: Phase 1 から順序通り実装してください。各フェーズ終了後に検証を行ってください。
