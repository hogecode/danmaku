/// ダンマク（コメント）の設定を表すモデル
class DanmakuSettings {
  final double opacity;      // 0.0 ~ 1.0
  final double speedRate;    // 0.25 ~ 2.0
  final bool isVisible;      // 表示/非表示

  const DanmakuSettings({
    this.opacity = 1.0,
    this.speedRate = 1.0,
    this.isVisible = true,
  });

  /// copyWith メソッド
  DanmakuSettings copyWith({
    double? opacity,
    double? speedRate,
    bool? isVisible,
  }) {
    return DanmakuSettings(
      opacity: opacity ?? this.opacity,
      speedRate: speedRate ?? this.speedRate,
      isVisible: isVisible ?? this.isVisible,
    );
  }

  @override
  String toString() =>
      'DanmakuSettings(opacity: $opacity, speedRate: $speedRate, isVisible: $isVisible)';
}
