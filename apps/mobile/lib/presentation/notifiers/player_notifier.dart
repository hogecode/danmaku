import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/domain/entities/player_entity.dart';

/// プレイヤー状態を管理するNotifier
class PlayerNotifier extends StateNotifier<PlayerEntity> {
  PlayerNotifier()
      : super(
          const PlayerEntity(
            currentTime: Duration.zero,
            duration: Duration.zero,
            isPlaying: false,
            isPaused: false,
            isFullscreen: false,
            playbackSpeed: 1.0,
            volume: 1.0,
            isLoading: false,
          ),
        );

  /// 再生状態を更新
  void updatePlayingState(bool isPlaying) {
    state = state.copyWith(
      isPlaying: isPlaying,
      isPaused: !isPlaying,
    );
  }

  /// 再生時間を更新
  void updateCurrentTime(Duration time) {
    state = state.copyWith(currentTime: time);
  }

  /// 総長を更新
  void updateDuration(Duration duration) {
    state = state.copyWith(duration: duration);
  }

  /// 再生速度を更新
  void updatePlaybackSpeed(double speed) {
    state = state.copyWith(playbackSpeed: speed);
  }

  /// 音量を更新
  void updateVolume(double volume) {
    state = state.copyWith(volume: volume.clamp(0.0, 1.0));
  }

  /// フルスクリーン状態を更新
  void updateFullscreen(bool isFullscreen) {
    state = state.copyWith(isFullscreen: isFullscreen);
  }

  /// ローディング状態を更新
  void updateLoading(bool isLoading) {
    state = state.copyWith(isLoading: isLoading);
  }

  /// エラーを設定
  void setError(String? error) {
    state = state.copyWith(errorMessage: error);
  }

  /// 状態をリセット
  void reset() {
    state = const PlayerEntity(
      currentTime: Duration.zero,
      duration: Duration.zero,
      isPlaying: false,
      isPaused: false,
      isFullscreen: false,
      playbackSpeed: 1.0,
      volume: 1.0,
      isLoading: false,
    );
  }
}

/// プレイヤーStateNotifierプロバイダー
final playerStateProvider =
    StateNotifierProvider<PlayerNotifier, PlayerEntity>((ref) {
  return PlayerNotifier();
});
