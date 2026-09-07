import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/widgets/video_player/models/danmaku_settings.dart';

/// ダンマク設定の状態管理
class DanmakuSettingsNotifier extends StateNotifier<DanmakuSettings> {
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
