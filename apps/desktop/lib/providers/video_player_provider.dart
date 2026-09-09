import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/danmaku_settings.dart';
import '../models/player_ui_state.dart';

/// ダンマク（コメント）設定のプロバイダー
final danmakuSettingsProvider =
    StateNotifierProvider<DanmakuSettingsNotifier, DanmakuSettings>(
  (ref) => DanmakuSettingsNotifier(),
);


/// ダンマク設定の状態管理
class DanmakuSettingsNotifier extends StateNotifier<DanmakuSettings> {
  // 初期状態はデフォルトの DanmakuSettings を使用
  DanmakuSettingsNotifier() : super(const DanmakuSettings());

  /// 透明度を更新
  void updateOpacity(double opacity) {
    state = state.copyWith(opacity: opacity.clamp(0.0, 1.0));
  }

  /// 速度を更新
  void updateSpeedRate(double speedRate) {
    state = state.copyWith(speedRate: speedRate.clamp(0.25, 2.0));
  }

  /// 表示/非表示を切り替え
  void toggleVisibility() {
    state = state.copyWith(isVisible: !state.isVisible);
  }

  /// 表示/非表示を設定
  void setVisibility(bool isVisible) {
    state = state.copyWith(isVisible: isVisible);
  }

  /// すべてをリセット
  void reset() {
    state = const DanmakuSettings();
  }
}


/// プレイヤーUI状態のプロバイダー
final playerUIStateProvider =
    StateNotifierProvider<PlayerUINotifier, PlayerUIState>(
  (ref) => PlayerUINotifier(),
);

/// プレイヤーUI状態の管理
class PlayerUINotifier extends StateNotifier<PlayerUIState> {
  PlayerUINotifier() : super(const PlayerUIState());

  /// コントローラーバーの表示/非表示を切り替え
  void toggleController() {
    state = state.copyWith(controllerVisible: !state.controllerVisible);
  }

  /// コントローラーバーの表示/非表示を設定
  void setControllerVisible(bool visible) {
    state = state.copyWith(controllerVisible: visible);
  }

  /// 設定パネルの表示/非表示を切り替え
  void toggleSettingsPanel() {
    state = state.copyWith(settingsPanelVisible: !state.settingsPanelVisible);
  }

  /// 設定パネルの表示/非表示を設定
  void setSettingsPanelVisible(bool visible) {
    state = state.copyWith(settingsPanelVisible: visible);
  }

  /// 両方を閉じる
  void closeAll() {
    state = const PlayerUIState();
  }
}


