import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:desktop/core/constants/color_constants.dart';

/// ビデオプレイヤーのコントローラーバー
/// 再生/一時停止、シークバー、速度変更などを管理
class ControllerBar extends ConsumerWidget {
  /// コールバック関数
  final VoidCallback? onPlayTapped;
  final VoidCallback? onPauseTapped;
  final Function(Duration)? onSeek;
  final Function(double)? onSpeedChange;
  final VoidCallback? onSettingsTapped;
  final VoidCallback? onFullscreenTapped;

  // 状態値
  final bool isPlaying;
  final Duration currentTime;
  final Duration duration;
  final double playbackSpeed;
  final bool isFullscreen;

  const ControllerBar({
    Key? key,
    this.onPlayTapped,
    this.onPauseTapped,
    this.onSeek,
    this.onSpeedChange,
    this.onSettingsTapped,
    this.onFullscreenTapped,
    required this.isPlaying,
    required this.currentTime,
    required this.duration,
    required this.playbackSpeed,
    required this.isFullscreen,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    try {
      // 再生時間と総時間を秒単位で取得（ゼロ除算を避ける）
      final currentSeconds = currentTime.inSeconds.toDouble();
      final maxSeconds = duration.inSeconds.toDouble();
      final safeMax = maxSeconds > 0 ? maxSeconds : 1.0;

      return Container(
        color: ColorConstants.lightControllerBg,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (safeMax > 0)
              SliderTheme(
                data: SliderThemeData(
                  trackHeight: 4,
                  thumbShape:
                      const RoundSliderThumbShape(enabledThumbRadius: 6),
                ),
                child: Slider(
                  value: currentSeconds.clamp(0, safeMax),
                  min: 0,
                  max: safeMax,
                  onChanged: (value) =>
                      onSeek?.call(Duration(seconds: value.toInt())),
                  activeColor: ColorConstants.lightPrimary,
                  inactiveColor: Colors.grey[400],
                ),
              )
            else
              Container(height: 4),
            Row(
              children: [
                // 再生/一時停止ボタン
                IconButton(
                  icon: Icon(
                    isPlaying ? Icons.pause : Icons.play_arrow,
                    color: Colors.white,
                    size: 20,
                  ),
                  onPressed: () {
                    if (isPlaying) {
                      onPauseTapped?.call();
                    } else {
                      onPlayTapped?.call();
                    }
                  },
                ),
                // 再生時間 / 総時間
                SizedBox(
                  width: 80,
                  child: Text(
                    '${_fmt(currentTime)} / ${_fmt(duration)}',
                    style: const TextStyle(
                        color: Colors.white, fontSize: 11),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
                const Spacer(),
                // 再生速度変更ボタン
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _SpeedButton(
                    currentSpeed: playbackSpeed,
                    onSpeedChange: onSpeedChange,
                  ),
                ),
                // 設定ボタン
                IconButton(
                  icon: const Icon(Icons.settings,
                      color: Colors.white, size: 20),
                  onPressed: onSettingsTapped,
                ),
                // フルスクリーン切替ボタン
                IconButton(
                  icon: Icon(
                    isFullscreen
                        ? Icons.fullscreen_exit
                        : Icons.fullscreen,
                    color: Colors.white,
                    size: 20,
                  ),
                  onPressed: onFullscreenTapped,
                ),
              ],
            ),
          ],
        ),
      );
    } catch (e, st) {
      debugPrint('=== Error in ControllerBar build ===');
      debugPrint('Error: $e');
      debugPrint('StackTrace: $st');
      debugPrint('====================================');
      return Container(
        color: ColorConstants.lightControllerBg,
        height: 50,
        child: Center(
          child: Text('エラー: ${e.toString()}',
              style: const TextStyle(
                  color: Colors.white, fontSize: 10),
              overflow: TextOverflow.ellipsis),
        ),
      );
    }
  }

  static String _fmt(Duration d) {
    String pad(int n) => n.toString().padLeft(2, '0');
    return '${pad(d.inMinutes.remainder(60))}:${pad(d.inSeconds.remainder(60))}';
  }
}

class _SpeedButton extends ConsumerWidget {
  final double currentSpeed;
  final Function(double)? onSpeedChange;

  const _SpeedButton({
    required this.currentSpeed,
    this.onSpeedChange,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<double>(
      initialValue: currentSpeed,
      itemBuilder: (_) => [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
          .map((s) =>
              PopupMenuItem(value: s, child: Text('${s.toStringAsFixed(2)}x')))
          .toList(),
      onSelected: onSpeedChange,
      child: Text('${currentSpeed.toStringAsFixed(2)}x',
          style: const TextStyle(color: Colors.white, fontSize: 12)),
    );
  }
}
