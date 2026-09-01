import 'package:flutter/material.dart';
import 'package:flutter_app/core/constants/app_constants.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';

/// 単一のダンマク Widget
/// AnimationController で滑らかに移動
class DanmakuItemWidget extends StatefulWidget {
  final DanmakuEntity danmaku;
  final int laneIndex;
  final double laneHeight;
  final double containerWidth;
  final double containerHeight;
  final double globalOpacity;
  final double globalSpeedRate;
  final double currentTime;
  final VoidCallback onRemove;

  const DanmakuItemWidget({
    Key? key,
    required this.danmaku,
    required this.laneIndex,
    required this.laneHeight,
    required this.containerWidth,
    required this.containerHeight,
    required this.globalOpacity,
    required this.globalSpeedRate,
    required this.currentTime,
    required this.onRemove,
  }) : super(key: key);

  @override
  State<DanmakuItemWidget> createState() => _DanmakuItemWidgetState();
}


class _DanmakuItemWidgetState extends State<DanmakuItemWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  double _estimatedTextWidth = 0;

  @override
  void initState() {
    super.initState();
    _estimateTextWidth();

    // AnimationController を作成（表示時間で動く）
    _animationController = AnimationController(
      duration: Duration(
        milliseconds: (AppConstants.danmakuDisplayDurationSeconds * 1000 /
                widget.globalSpeedRate)
            .toInt(),
      ),
      vsync: this,
    );

    // animation を作成（0 -> 1）
    _animation = Tween<double>(begin: 0, end: 1).animate(_animationController);

    // animation が完了したら削除
    _animationController.forward().then((_) {
      if (mounted) {
        widget.onRemove();
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _estimateTextWidth() {
    final fontSize = widget.danmaku.size.fontSize;
    _estimatedTextWidth = widget.danmaku.text.length * fontSize * 0.6;
  }

  @override
  Widget build(BuildContext context) {
    // animation 値から progress を計算
    final progress = _animation.value;

    // X 座標を計算
    double offsetX = 0;
    if (widget.danmaku.type.value == 'right') {
      offsetX = widget.containerWidth -
          (widget.containerWidth + _estimatedTextWidth) * progress;
    }

    // Y 座標を計算
    double offsetY = widget.laneIndex * widget.laneHeight + 8;

    // 不透明度を計算
    double opacity = widget.globalOpacity;
    if (widget.danmaku.type.value == 'top' ||
        widget.danmaku.type.value == 'bottom') {
      if (progress > 0.8) {
        opacity *= 1 - ((progress - 0.8) / 0.2);
      }
    }

    final fontSize = widget.danmaku.size.fontSize;

    return Positioned(
      left: offsetX,
      top: widget.danmaku.type.value == 'bottom' ? null : offsetY,
      bottom: widget.danmaku.type.value == 'bottom' ? offsetY : null,
      child: RepaintBoundary(
        child: Opacity(
          opacity: opacity.clamp(0.0, 1.0),
          child: Text(
            widget.danmaku.text,
            style: TextStyle(
              color: widget.danmaku.color,
              fontSize: fontSize * 1.5,
              fontWeight: FontWeight.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
    );
  }
}
