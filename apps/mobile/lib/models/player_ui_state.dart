/// プレイヤーUI状態を表すモデル
class PlayerUIState {
  final bool controllerVisible;
  final bool settingsPanelVisible;

  const PlayerUIState({
    this.controllerVisible = true,
    this.settingsPanelVisible = false,
  });

  /// copyWith メソッド
  PlayerUIState copyWith({
    bool? controllerVisible,
    bool? settingsPanelVisible,
  }) {
    return PlayerUIState(
      controllerVisible: controllerVisible ?? this.controllerVisible,
      settingsPanelVisible: settingsPanelVisible ?? this.settingsPanelVisible,
    );
  }

  @override
  String toString() =>
      'PlayerUIState(controllerVisible: $controllerVisible, settingsPanelVisible: $settingsPanelVisible)';
}
