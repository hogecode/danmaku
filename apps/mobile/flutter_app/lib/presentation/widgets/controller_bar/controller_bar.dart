import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/color_constants.dart';
import 'package:flutter_app/presentation/notifiers/player_notifier.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/presentation/widgets/settings/danmaku_settings.dart';

class ControllerBar extends ConsumerWidget {
  final VoidCallback? onPlayTapped;
  final VoidCallback? onPauseTapped;
  final Function(Duration)? onSeek;
  final Function(double)? onSpeedChange;
  final VoidCallback? onSettingsTapped;
  final VoidCallback? onFullscreenTapped;

  const ControllerBar({
    Key? key,
    this.onPlayTapped,
    this.onPauseTapped,
    this.onSeek,
    this.onSpeedChange,
    this.onSettingsTapped,
    this.onFullscreenTapped,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerStateProvider);
    final opacity = ref.watch(danmakuOpacityProvider);
    final speedRate = ref.watch(danmakuSpeedRateProvider);

    return Container(
      color: ColorConstants.lightControllerBg,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SliderTheme(
            data: SliderThemeData(
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
            ),
            child: Slider(
              value: playerState.currentTime.inSeconds.toDouble(),
              max: playerState.duration.inSeconds.toDouble(),
              onChanged: (value) => onSeek?.call(Duration(seconds: value.toInt())),
              activeColor: ColorConstants.lightPrimary,
              inactiveColor: Colors.grey[400],
            ),
          ),
          Row(
            children: [
              IconButton(
                icon: Icon(
                  playerState.isPlaying ? Icons.pause : Icons.play_arrow,
                  color: Colors.white,
                  size: 20,
                ),
                onPressed: () {
                  if (playerState.isPlaying) onPauseTapped?.call();
                  else onPlayTapped?.call();
                },
              ),
              Text(
                '${_fmt(playerState.currentTime)} / ${_fmt(playerState.duration)}',
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
              const Spacer(),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: _SpeedButton(
                  currentSpeed: playerState.playbackSpeed,
                  onSpeedChange: onSpeedChange,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.subtitles, color: Colors.white, size: 20),
                onPressed: () => showModalBottomSheet(
                  context: context,
                  backgroundColor: Colors.transparent,
                  builder: (_) => Container(
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                    ),
                    child: const DanmakuSettingsPanel(),
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.settings, color: Colors.white, size: 20),
                onPressed: onSettingsTapped,
              ),
              IconButton(
                icon: Icon(
                  playerState.isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
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
  }

  static String _fmt(Duration d) {
    String pad(int n) => n.toString().padLeft(2, '0');
    return '${pad(d.inMinutes.remainder(60))}:${pad(d.inSeconds.remainder(60))}';
  }
}

class _SpeedButton extends ConsumerWidget {
  final double currentSpeed;
  final Function(double)? onSpeedChange;

  const _SpeedButton({required this.currentSpeed, this.onSpeedChange});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<double>(
      initialValue: currentSpeed,
      itemBuilder: (_) => [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
          .map((s) => PopupMenuItem(value: s, child: Text('${s.toStringAsFixed(2)}x')))
          .toList(),
      onSelected: onSpeedChange,
      child: Text('${currentSpeed.toStringAsFixed(2)}x', style: const TextStyle(color: Colors.white, fontSize: 12)),
    );
  }
}
