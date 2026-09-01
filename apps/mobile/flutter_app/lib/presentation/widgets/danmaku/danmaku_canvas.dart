import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';
import 'package:flutter_app/domain/usecases/fetch_danmaku_usecase.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_engine.dart';
import 'package:flutter_app/presentation/notifiers/danmaku_notifier.dart';
import 'package:flutter_app/presentation/providers/app_provider.dart';
import 'package:logger/logger.dart';

/// ダンマク Canvas ウィジェット
class DanmakuCanvas extends ConsumerStatefulWidget {
  final double currentTime;
  final double globalOpacity;
  final double globalSpeedRate;

  const DanmakuCanvas({
    Key? key,
    required this.currentTime,
    required this.globalOpacity,
    required this.globalSpeedRate,
  }) : super(key: key);

  @override
  ConsumerState<DanmakuCanvas> createState() => _DanmakuCanvasState();
}

class _DanmakuCanvasState extends ConsumerState<DanmakuCanvas>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late DanmakuEngine _engine;
  late Logger _logger;
  late FetchDanmakuUseCase _fetchUseCase;

  @override
  void initState() {
    super.initState();
    _logger = Logger();

    // ダンマクエンジンを初期化
    _engine = DanmakuEngine(
      globalOpacity: widget.globalOpacity,
      globalSpeedRate: widget.globalSpeedRate,
    );

    // FetchDanmakuUseCase を事前に取得
    _fetchUseCase = ref.read(fetchDanmakuUseCaseProvider);

    // アニメーションコントローラーを設定（60fps）
    _animationController = AnimationController(
      duration: const Duration(days: 1), // 十分に長い期間
      vsync: this,
    )..addListener(_onAnimationTick);

    _animationController.forward();
  }

  @override
  void didUpdateWidget(DanmakuCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);

    // グローバルパラメータを更新
    _engine.globalOpacity = widget.globalOpacity;
    _engine.globalSpeedRate = widget.globalSpeedRate;
  }

  /// アニメーション毎フレーム（60fps）
  void _onAnimationTick() {
    // フレームを計算
    _calculateFrame();

    // Canvas を再描画
    if (mounted) {
      setState(() {});
    }
  }

  /// フレームを計算
  void _calculateFrame() {
    final size = MediaQuery.of(context).size;
    _engine.calculateFrame(
      widget.currentTime,
      size.height,
      size.width,
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _engine.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    try {
      // 既に保存した FetchDanmakuUseCase を使用
      final danmakuState = ref.watch(danmakuStateProvider(_fetchUseCase));

      // ダンマクをエンジンに追加
      if (danmakuState.danmakuList.isNotEmpty) {
        _addDanmakuToEngine(danmakuState.danmakuList);
      }

      return RepaintBoundary(
        child: CustomPaint(
          painter: _DanmakuPainter(
            engine: _engine,
            globalOpacity: widget.globalOpacity,
          ),
          size: Size.infinite,
        ),
      );
    } catch (e) {
      _logger.e('Error in DanmakuCanvas build: $e');
      // エラー時は何も描画しない（透明）
      return Container();
    }
  }

  /// ダンマクをエンジンに追加
  void _addDanmakuToEngine(List<DanmakuEntity> danmakuList) {
    final size = MediaQuery.of(context).size;

    for (var danmaku in danmakuList) {
      // すでに追加済みかチェック
      final exists = _engine.particles
          .any((p) => p.entity.id == danmaku.id && p.entity.text == danmaku.text);

      if (!exists) {
        _engine.addDanmaku(
          danmaku,
          widget.currentTime,
          size.height,
          size.width,
        );
      }
    }
  }
}

/// ダンマク描画 Painter
class _DanmakuPainter extends CustomPainter {
  final DanmakuEngine engine;
  final double globalOpacity;

  _DanmakuPainter({
    required this.engine,
    required this.globalOpacity,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 各粒子を描画
    for (var particle in engine.particles) {
      if (particle.isVisible) {
        _drawParticle(canvas, particle, globalOpacity);
      }
    }
  }

  /// 粒子を描画
  void _drawParticle(Canvas canvas, dynamic particle, double opacity) {
    canvas.save();

    // 位置を設定
    canvas.translate(particle.x, particle.y);

    // TextPainter を取得
    final textPainter = particle.getOrCreateTextPainter();

    // 不透明度を計算（グローバル × ローカル）
    final finalOpacity = opacity * particle.opacity;

    // テキストを描画
    // NOTE: opacity を適用するには Paint を使う必要がある
    // ここでは単純な描画を実装
    textPainter.paint(canvas, const Offset(0, 0));

    canvas.restore();
  }

  @override
  bool shouldRepaint(_DanmakuPainter oldDelegate) {
    // 毎フレーム再描画が必要
    return true;
  }

  @override
  bool shouldRebuildSemantics(_DanmakuPainter oldDelegate) {
    return false;
  }
}
