import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/widgets/video_player/models/danmaku_settings.dart';
import 'package:mobile/widgets/video_player/models/player_ui_state.dart';
import 'package:mobile/widgets/video_player/notifiers/danmaku_settings_notifier.dart';
import 'package:mobile/widgets/video_player/notifiers/player_ui_notifier.dart';

/// ダンマク（コメント）設定のプロバイダー
final danmakuSettingsProvider =
    StateNotifierProvider<DanmakuSettingsNotifier, DanmakuSettings>((ref) {
  return DanmakuSettingsNotifier();
});

/// プレイヤーUI状態のプロバイダー
final playerUIStateProvider =
    StateNotifierProvider<PlayerUINotifier, PlayerUIState>((ref) {
  return PlayerUINotifier();
});

/// コントローラーバー表示状態
final controllerVisibleProvider = StateProvider<bool>((ref) {
  return ref.watch(playerUIStateProvider).controllerVisible;
});

/// 設定パネル表示状態
final settingsPanelVisibleProvider = StateProvider<bool>((ref) {
  return ref.watch(playerUIStateProvider).settingsPanelVisible;
});

/// コメント透明度
final danmakuOpacityProvider = StateProvider<double>((ref) {
  return ref.watch(danmakuSettingsProvider).opacity;
});

/// コメント速度
final danmakuSpeedRateProvider = StateProvider<double>((ref) {
  return ref.watch(danmakuSettingsProvider).speedRate;
});

/// コメント表示/非表示
final danmakuVisibilityProvider = StateProvider<bool>((ref) {
  return ref.watch(danmakuSettingsProvider).isVisible;
});
