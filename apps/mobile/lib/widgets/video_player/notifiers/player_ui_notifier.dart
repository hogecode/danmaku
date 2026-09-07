import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/widgets/video_player/models/player_ui_state.dart';

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
