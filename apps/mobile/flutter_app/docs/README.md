# Flutter DPlayer - ドキュメント

Flutter ベースのダンマク動画プレイヤー実装プロジェクト

---

## 📋 ドキュメント一覧

| # | ファイル | 内容 | 対象者 |
|---|---------|------|--------|
| 0 | [00_PROJECT_OVERVIEW.md](./00_PROJECT_OVERVIEW.md) | プロジェクト概要・要件定義 | PM, リード |
| 1 | [01_ARCHITECTURE.md](./01_ARCHITECTURE.md) | システムアーキテクチャ・データフロー | 設計者 |
| 2 | [02_MODELS_SCHEMA.md](./02_MODELS_SCHEMA.md) | データモデル・型定義仕様 | エンジニア |
| 3 | [03_API_SPECIFICATION.md](./03_API_SPECIFICATION.md) | API 仕様書・エンドポイント | エンジニア |
| 4 | [04_UI_SPECIFICATIONS.md](./04_UI_SPECIFICATIONS.md) | UI/UX 仕様書・レイアウト | デザイナー, エンジニア |
| 5 | [05_DANMAKU_ENGINE.md](./05_DANMAKU_ENGINE.md) | ダンマク描画エンジン詳細仕様 | エンジニア（コア機能） |
| 6 | [06_IMPLEMENTATION_GUIDE.md](./06_IMPLEMENTATION_GUIDE.md) | 実装ガイド・手順書 | エンジニア |

---

## 🎯 クイックスタート

### ドキュメント読む順序

**1. プロジェクト全体を理解したい**
```
00_PROJECT_OVERVIEW.md
   ↓
01_ARCHITECTURE.md
   ↓
04_UI_SPECIFICATIONS.md
```

**2. 実装を開始したい**
```
02_MODELS_SCHEMA.md
   ↓
03_API_SPECIFICATION.md
   ↓
06_IMPLEMENTATION_GUIDE.md
```

**3. ダンマク描画をカスタマイズしたい**
```
05_DANMAKU_ENGINE.md
```

---

## 📊 プロジェクト構成

```
flutter_app/
├── docs/                          # ← ドキュメント（このフォルダ）
│   ├── 00_PROJECT_OVERVIEW.md
│   ├── 01_ARCHITECTURE.md
│   ├── 02_MODELS_SCHEMA.md
│   ├── 03_API_SPECIFICATION.md
│   ├── 04_UI_SPECIFICATIONS.md
│   ├── 05_DANMAKU_ENGINE.md
│   ├── 06_IMPLEMENTATION_GUIDE.md
│   └── README.md
│
├── lib/                           # ← ソースコード（実装後）
│   ├── core/
│   ├── data/
│   ├── domain/
│   ├── presentation/
│   └── main.dart
│
├── test/                          # ← テスト（実装後）
│   ├── unit/
│   └── integration/
│
├── pubspec.yaml
└── analysis_options.yaml
```

---

## 🔑 重要な概念

### Clean Architecture

このプロジェクトは Clean Architecture（クリーンアーキテクチャ）に従って設計されています：

- **Presentation Layer**: UI・ウィジェット・状態管理
- **Domain Layer**: ビジネスロジック・Entities・UseCases
- **Data Layer**: API・ストレージ・リポジトリ

詳細: [01_ARCHITECTURE.md](./01_ARCHITECTURE.md)

### Riverpod 状態管理

すべての状態管理は Riverpod を使用します：

```dart
// Provider（読み取り専用）
final playerStateProvider = Provider((ref) => ...);

// StateNotifier（読み書き可能）
final danmakuStateProvider = 
  StateNotifierProvider((ref) => DanmakuNotifier(...));
```

詳細: [01_ARCHITECTURE.md](./01_ARCHITECTURE.md#-riverpod-state-management)

### ダンマク描画エンジン

Core 機能。CustomPaint + Canvas で 60fps フレームレート維持：

- Right（右→左 流動）
- Top（上部 固定）
- Bottom（下部 固定）

詳細: [05_DANMAKU_ENGINE.md](./05_DANMAKU_ENGINE.md)

---

## 📦 依存パッケージ一覧

| パッケージ | 用途 |
|-----------|------|
| `video_player` | ビデオ再生 |
| `flutter_riverpod` | 状態管理 |
| `dio` + `retrofit` | API クライアント |
| `hive` | ローカル キャッシング |
| `intl` | 多言語対応 |
| `logger` | ロギング |

---

## 🎬 実装フェーズ

### Phase 1: 基盤構築（3-4 日）
- Flutter プロジェクト初期化
- API クライアント実装
- 基本プレイヤー UI（ダンマク無し）

### Phase 2: ダンマク描画エンジン（5-7 日） ← **最重要**
- CustomPaint 実装
- 複数軌道管理
- コリジョン検出
- パフォーマンス最適化

### Phase 3: UI/コントローラー（2-3 日）
- コントローラーバー
- 設定パネル
- 多言語対応

### Phase 4: API 連携・テスト（1-2 日）
- API 統合
- ユニット・統合テスト

詳細: [06_IMPLEMENTATION_GUIDE.md](./06_IMPLEMENTATION_GUIDE.md)

---

## 🚀 本番環境デプロイ

```bash
# iOS
flutter build ios --release

# Android
flutter build apk --release
flutter build appbundle --release
```

詳細: [06_IMPLEMENTATION_GUIDE.md](./06_IMPLEMENTATION_GUIDE.md#-ビルドデプロイ)

---

## 📞 サポート

### よくある質問

**Q: DPlayer（TypeScript版）との互換性は？**
A: API レスポンス形式と型定義を DPlayer 互換に設計しました。
詳細: [02_MODELS_SCHEMA.md](./02_MODELS_SCHEMA.md#-dplayer-との互換性)

**Q: ダンマクが遅い、ちらつく**
A: パフォーマンス最適化セクションを確認してください。
詳細: [05_DANMAKU_ENGINE.md](./05_DANMAKU_ENGINE.md#-パフォーマンス最適化)

**Q: API サーバーに接続できない**
A: API 設定とネットワークエラーハンドリングを確認してください。
詳細: [03_API_SPECIFICATION.md](./03_API_SPECIFICATION.md) & [06_IMPLEMENTATION_GUIDE.md](./06_IMPLEMENTATION_GUIDE.md#-よくある問題と対処)

---

## 📝 ライセンス

MIT License

---

**作成日**: 2026年8月30日  
**バージョン**: 1.0.0-spec  
**ステータス**: 仕様書フェーズ完了（実装前）
