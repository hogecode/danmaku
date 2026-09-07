# VideoPlayer Widget

高機能な動画プレイヤーウィジェット

## 構成

```
video_player/
├── player_page.dart          # メインプレイヤーページ
├── video_view.dart           # ビデオ表示ウィジェット
├── controller_bar.dart       # コントロールバー
├── settings/
│   └── settings_panel.dart   # コメント設定パネル
├── danmaku/
│   ├── danmaku_canvas.dart           # コメント描画キャンバス
│   ├── danmaku_item_widget.dart      # コメント単体ウィジェット
│   ├── danmaku_lane_manager.dart     # コメントレーン管理
│   ├── danmaku_particle.dart         # コメント粒子
│   └── collision_detector.dart       # コリジョン検出
├── notifiers/
│   ├── danmaku_settings_notifier.dart
│   └── player_ui_notifier.dart
└── models/
    ├── player_entity.dart
    ├── danmaku_settings.dart
    └── player_ui_state.dart
```

## 使用方法

### 基本的な使い方

```dart
import 'package:mobile/presentation/widgets/video_player/player_page.dart';
import 'package:mobile/presentation/widgets/video_player/danmaku/danmaku_particle.dart';

// プレイヤーを表示
VideoPlayerPage(
  videoUrl: 'https://example.com/video.mp4',
  fileName: '動画タイトル',
  danmakuList: [
    DanmakuEntity(
      text: 'コメント1',
      time: 5.0,
      type: DanmakuType('right'),
      color: Colors.white,
    ),
  ],
)
```

## Providers

### danmakuSettingsProvider
コメント設定（透明度、速度、表示/非表示）を管理

```dart
final settings = ref.watch(danmakuSettingsProvider);
ref.read(danmakuSettingsProvider.notifier).updateOpacity(0.8);
ref.read(danmakuSettingsProvider.notifier).updateSpeedRate(1.5);
ref.read(danmakuSettingsProvider.notifier).setVisibility(false);
```

### playerUIStateProvider
UI表示状態（コントローラーバー、設定パネル）を管理

```dart
final uiState = ref.watch(playerUIStateProvider);
ref.read(playerUIStateProvider.notifier).toggleController();
ref.read(playerUIStateProvider.notifier).toggleSettingsPanel();
```

## コメント（ダンマク）の形式

```dart
DanmakuEntity(
  id: 'unique-id',           // オプション
  text: 'コメントテキスト',      // 必須
  time: 5.0,                 // 秒単位の開始時刻
  type: DanmakuType('right'), // 'right', 'top', 'bottom'
  color: Colors.white,        // コメント色
  size: DanmakuSize(fontSize: 16), // フォントサイズ
  author: 'ユーザー名',         // オプション
)
```

## カスタマイズ

### コメント速度
`danmakuSettings.speedRate` で 0.25x ～ 2.0x 範囲で調整

### コメント透明度
`danmakuSettings.opacity` で 0.0 ～ 1.0 範囲で調整

### 表示時間
`AppConstants.danmakuDisplayDurationSeconds` で調整（デフォルト: 6秒）

## トラブルシューティング

### コメントが表示されない
- `danmakuList` が空でないか確認
- `danmakuSettings.isVisible` が `true` か確認
- `time` が現在の再生位置より小さいか確認

### パフォーマンスが低い
- `maxDanmakuCount` を `AppConstants` で調整
- コメント表示を一時的に無効化
- スピードレートを下げる

## ライセンス

内部使用のみ
