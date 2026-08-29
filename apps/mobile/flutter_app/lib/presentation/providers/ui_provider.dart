import 'package:flutter_riverpod/flutter_riverpod.dart';

/// UI 状態プロバイダー

/// ダンマク不透明度プロバイダー（0.0 ~ 1.0）
final danmakuOpacityProvider = StateProvider<double>((ref) {
  return 1.0;
});

/// ダンマク速度倍率プロバイダー（0.5 ~ 3.0）
final danmakuSpeedRateProvider = StateProvider<double>((ref) {
  return 1.0;
});

/// ダンマク表示/非表示プロバイダー
final danmakuVisibilityProvider = StateProvider<bool>((ref) {
  return true;
});

/// ダークモードプロバイダー
final darkModeProvider = StateProvider<bool>((ref) {
  return false;
});

/// コントローラー表示中プロバイダー
final controllerVisibleProvider = StateProvider<bool>((ref) {
  return true;
});

/// 設定パネル表示中プロバイダー
final settingsPanelVisibleProvider = StateProvider<bool>((ref) {
  return false;
});
