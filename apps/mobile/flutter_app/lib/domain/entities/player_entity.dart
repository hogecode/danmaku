/// プレイヤー状態 Entity
class PlayerEntity {
  /// 現在の再生時間（秒）
  final Duration currentTime;

  /// 総ビデオ長（秒）
  final Duration duration;

  /// 再生中フラグ
  final bool isPlaying;

  /// 一時停止フラグ
  final bool isPaused;

  /// フルスクリーンフラグ
  final bool isFullscreen;

  /// 現在の再生速度（1.0 = 通常速度）
  final double playbackSpeed;

  /// 現在の音量（0.0 ~ 1.0）
  final double volume;

  /// ビデオローディング中フラグ
  final bool isLoading;

  /// エラーメッセージ
  final String? errorMessage;

  const PlayerEntity({
    required this.currentTime,
    required this.duration,
    this.isPlaying = false,
    this.isPaused = false,
    this.isFullscreen = false,
    this.playbackSpeed = 1.0,
    this.volume = 1.0,
    this.isLoading = false,
    this.errorMessage,
  });

  /// コピー（一部フィールド更新）
  PlayerEntity copyWith({
    Duration? currentTime,
    Duration? duration,
    bool? isPlaying,
    bool? isPaused,
    bool? isFullscreen,
    double? playbackSpeed,
    double? volume,
    bool? isLoading,
    String? errorMessage,
  }) =>
      PlayerEntity(
        currentTime: currentTime ?? this.currentTime,
        duration: duration ?? this.duration,
        isPlaying: isPlaying ?? this.isPlaying,
        isPaused: isPaused ?? this.isPaused,
        isFullscreen: isFullscreen ?? this.isFullscreen,
        playbackSpeed: playbackSpeed ?? this.playbackSpeed,
        volume: volume ?? this.volume,
        isLoading: isLoading ?? this.isLoading,
        errorMessage: errorMessage ?? this.errorMessage,
      );

  @override
  String toString() =>
      'PlayerEntity(currentTime: $currentTime, duration: $duration, isPlaying: $isPlaying, playbackSpeed: $playbackSpeed)';
}
