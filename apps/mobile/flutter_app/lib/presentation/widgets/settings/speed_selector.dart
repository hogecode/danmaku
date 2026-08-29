import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/color_constants.dart';
import 'package:flutter_app/presentation/notifiers/player_notifier.dart';

/// 再生速度セレクターウィジェット
class SpeedSelector extends ConsumerWidget {
  final Function(double)? onSpeedChange;
  final bool showDialog;

  const SpeedSelector({
    Key? key,
    this.onSpeedChange,
    this.showDialog = false,
  }) : super(key: key);

  static const List<double> speeds = [
    0.25,
    0.5,
    0.75,
    1.0,
    1.25,
    1.5,
    1.75,
    2.0,
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerStateProvider);
    final currentSpeed = playerState.playbackSpeed;

    if (showDialog) {
      return _buildDialog(context, ref, currentSpeed);
    }

    return _buildMenu(context, ref, currentSpeed);
  }

  /// メニュー形式（ポップアップ）
  Widget _buildMenu(BuildContext context, WidgetRef ref, double currentSpeed) {
    return PopupMenuButton<double>(
      initialValue: currentSpeed,
      itemBuilder: (context) => speeds
          .map(
            (speed) => PopupMenuItem(
              value: speed,
              child: Text(
                '${speed.toStringAsFixed(2)}x',
                style: TextStyle(
                  fontWeight: speed == currentSpeed ? FontWeight.bold : null,
                ),
              ),
            ),
          )
          .toList(),
      onSelected: (speed) {
        ref.read(playerStateProvider.notifier).updatePlaybackSpeed(speed);
        onSpeedChange?.call(speed);
      },
      child: Text(
        '${currentSpeed.toStringAsFixed(2)}x',
        style: const TextStyle(color: Colors.white, fontSize: 12),
      ),
    );
  }

  /// ダイアログ形式（グリッド）
  Widget _buildDialog(BuildContext context, WidgetRef ref, double currentSpeed) {
    return SimpleDialog(
      title: const Text('再生速度'),
      backgroundColor: ColorConstants.lightBackground,
      children: [
        GridView.count(
          shrinkWrap: true,
          crossAxisCount: 4,
          childAspectRatio: 1.5,
          padding: const EdgeInsets.all(8),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          children: speeds
              .map(
                (speed) => _SpeedButton(
                  speed: speed,
                  isSelected: speed == currentSpeed,
                  onPressed: () {
                    ref
                        .read(playerStateProvider.notifier)
                        .updatePlaybackSpeed(speed);
                    onSpeedChange?.call(speed);
                    Navigator.pop(context);
                  },
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

/// 速度ボタン
class _SpeedButton extends StatelessWidget {
  final double speed;
  final bool isSelected;
  final VoidCallback onPressed;

  const _SpeedButton({
    required this.speed,
    required this.isSelected,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSelected
          ? ColorConstants.lightPrimary
          : Colors.grey[300],
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: Center(
          child: Text(
            '${speed.toStringAsFixed(2)}x',
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? Colors.white : Colors.black,
            ),
          ),
        ),
      ),
    );
  }
}
