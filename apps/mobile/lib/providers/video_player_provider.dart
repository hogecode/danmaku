import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/video_player/models/danmaku_settings.dart';
import '../widgets/video_player/models/player_ui_state.dart';
import '../widgets/video_player/notifiers/danmaku_settings_notifier.dart';
import '../widgets/video_player/notifiers/player_ui_notifier.dart';

/// ダンマク（コメント）設定のプロバイダー
/// 
/// 使用例:
/// ```dart
/// final settings = ref.watch(danmakuSettingsProvider);
/// ref.read(danmakuSettingsProvider.notifier).updateOpacity(0.8);
/// ref.read(danmakuSettingsProvider.notifier).updateSpeedRate(1.5);
/// ```
final danmakuSettingsProvider =
    StateNotifierProvider<DanmakuSettingsNotifier, DanmakuSettings>(
  (ref) => DanmakuSettingsNotifier(),
);


/// プレイヤーUI状態のプロバイダー
/// 
/// 使用例:
/// ```dart
/// final uiState = ref.watch(playerUIStateProvider);
/// ref.read(playerUIStateProvider.notifier).toggleController();
/// ref.read(playerUIStateProvider.notifier).toggleSettingsPanel();
/// ```
final playerUIStateProvider =
    StateNotifierProvider<PlayerUINotifier, PlayerUIState>(
  (ref) => PlayerUINotifier(),
);
