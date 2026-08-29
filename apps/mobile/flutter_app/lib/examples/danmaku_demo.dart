import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/color_constants.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_canvas.dart';

class DanmakuDemoPage extends ConsumerStatefulWidget {
  const DanmakuDemoPage({Key? key}) : super(key: key);

  @override
  ConsumerState<DanmakuDemoPage> createState() => _DanmakuDemoPageState();
}

class _DanmakuDemoPageState extends ConsumerState<DanmakuDemoPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  double _time = 0.0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(days: 1), vsync: this);
    _controller.addListener(() => setState(() => _time = _controller.value * 10.0));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final opacity = ref.watch(danmakuOpacityProvider);
    final speed = ref.watch(danmakuSpeedRateProvider);
    final visible = ref.watch(danmakuVisibilityProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ダンマク表示デモ'),
        backgroundColor: ColorConstants.lightPrimary,
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              color: Colors.black,
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.grey[900]!, Colors.black],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                  if (visible) DanmakuCanvas(currentTime: _time, globalOpacity: opacity, globalSpeedRate: speed),
                  Positioned(
                    top: 16,
                    left: 16,
                    child: Text('Time: ${_time.toStringAsFixed(2)}s', style: const TextStyle(color: Colors.white)),
                  ),
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('Opacity: ${(opacity * 100).toInt()}%', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                        Text('Speed: ${speed.toStringAsFixed(2)}x', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            color: ColorConstants.lightControllerBg,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('不透明度: ${(opacity * 100).toInt()}%', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Slider(value: opacity, onChanged: (v) => ref.read(danmakuOpacityProvider.notifier).state = v, min: 0, max: 1, activeColor: ColorConstants.lightPrimary),
                const SizedBox(height: 12),
                Text('速度: ${speed.toStringAsFixed(2)}x', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Slider(value: speed, onChanged: (v) => ref.read(danmakuSpeedRateProvider.notifier).state = v, min: 0.5, max: 3.0, activeColor: ColorConstants.lightPrimary),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Switch(value: visible, onChanged: (v) => ref.read(danmakuVisibilityProvider.notifier).state = v, activeColor: ColorConstants.lightPrimary),
                    const Spacer(),
                    ElevatedButton.icon(onPressed: () => setState(() => _controller.isAnimating ? _controller.stop() : _controller.forward(from: _time / 10)), icon: Icon(_controller.isAnimating ? Icons.pause : Icons.play_arrow), label: Text(_controller.isAnimating ? '一時停止' : '再生')),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
