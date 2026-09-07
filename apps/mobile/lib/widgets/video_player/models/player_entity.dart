/// プレイヤー状態を表すエンティティ（最小限）
class PlayerEntity {
  final Duration currentTime;
  final Duration duration;
  final bool isPlaying;
  final double playbackSpeed;
  final bool isFullscreen;
  final bool isLoading;
  final String? errorMessage;

  const PlayerEntity({
    this.currentTime = const Duration(milliseconds: 0),
    this.duration = const Duration(milliseconds: 0),
    this.isPlaying = false,
    this.playbackSpeed = 1.0,
    this.isFullscreen = false,
    this.isLoading = false,
    this.errorMessage,
  });

  /// copyWith メソッド
  PlayerEntity copyWith({
    Duration? currentTime,
    Duration? duration,
    bool? isPlaying,
    double? playbackSpeed,
    bool? isFullscreen,
    bool? isLoading,
    String? errorMessage,
  }) {
    return PlayerEntity(
      currentTime: currentTime ?? this.currentTime,
      duration: duration ?? this.duration,
      isPlaying: isPlaying ?? this.isPlaying,
      playbackSpeed: playbackSpeed ?? this.playbackSpeed,
      isFullscreen: isFullscreen ?? this.isFullscreen,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  String toString() =>
      'PlayerEntity(currentTime: $currentTime, duration: $duration, isPlaying: $isPlaying, playbackSpeed: $playbackSpeed, isFullscreen: $isFullscreen, isLoading: $isLoading, errorMessage: $errorMessage)';
}
