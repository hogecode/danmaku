import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
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
  late DanmakuEngine _engine;
  late Logger _logger;
  late FetchDanmakuUseCase _fetchUseCase;
  late Ticker _ticker;

  // 追加済みのダンマク ID を追跡
  final Set<String> _addedDanmakuIds = {};

  // 前回の danmakuState を保持（リファレンス比較用）
  DanmakuState? _lastDanmakuState;

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

    // Ticker を設定（毎フレーム実行）
    int _tickCount = 0;
    _ticker = createTicker((elapsed) {
      _tickCount++;
      final size = MediaQuery.of(context).size;

      // ✅ widget.currentTime を使用（PlayerPage が Riverpod から取得して渡してくれる）
      final currentTime = widget.currentTime;

      if (_tickCount % 60 == 0) {  // 60フレームごとに（約1秒）
        _logger.d('⏱️ Ticker #$_tickCount - time: ${currentTime.toStringAsFixed(2)}s, particles: ${_engine.particles.length}, visible: ${_engine.particles.where((p) => p.isVisible).length}');
      }

      // エンジンのフレーム計算
      _engine.calculateFrame(
        currentTime,
        size.height,
        size.width,
      );

      // 再描画トリガー
      setState(() {});
    });

    _ticker.start();
    _logger.i('✅ Ticker started');
  }

  @override
  void didUpdateWidget(DanmakuCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);

    // グローバルパラメータを更新
    if (oldWidget.globalOpacity != widget.globalOpacity) {
      _engine.globalOpacity = widget.globalOpacity;
    }
    if (oldWidget.globalSpeedRate != widget.globalSpeedRate) {
      _engine.globalSpeedRate = widget.globalSpeedRate;
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    _engine.clear();
    _addedDanmakuIds.clear();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // MediaQuery の変化時（画面リサイズ等）は engine をクリアして再初期化
    // ⚠️ でし追加済みダンマクの重複は防ぐため、_addedDanmakuIds はクリアしない
    _engine.clear();
    _lastDanmakuState = null;
    _logger.i('🔄 didChangeDependencies - engine cleared, ready for re-initialization');
  }

  @override
  Widget build(BuildContext context) {
    try {
      // 既に保存した FetchDanmakuUseCase を使用
      final danmakuState = ref.watch(danmakuStateProvider(_fetchUseCase));

      _logger.d('🎬 Build called - danmakuList: ${danmakuState.danmakuList.length}, isLoading: ${danmakuState.isLoading}');

      // 前回と異なるダンマク状態かチェック
      // ✅ _lastDanmakuState が null（リサイズ後）のときも、ダンマクを再追加
      if (_lastDanmakuState?.danmakuList != danmakuState.danmakuList || _lastDanmakuState == null) {
        if (danmakuState.danmakuList.isNotEmpty) {
          _logger.i('🔄 Danmaku list changed or engine reinitialized - adding ${danmakuState.danmakuList.length} items');
          _addNewDanmaku(danmakuState.danmakuList);
        }
        _lastDanmakuState = danmakuState;
      }

      // 常に RepaintBoundary を返す（Ticker で毎フレーム build が呼ばれる）
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
      _logger.e('❌ Error in DanmakuCanvas build: $e');
      return Container();
    }
  }

  /// 新しいダンマクのみをエンジンに追加
  void _addNewDanmaku(List<DanmakuEntity> danmakuList) {
    if (danmakuList.isEmpty) {
      return;
    }

    final size = MediaQuery.of(context).size;
    int addedCount = 0;

    for (var danmaku in danmakuList) {
      // 重複チェック（ID + テキスト + 時刻の組み合わせで一意性を判定）
      final uniqueKey = '${danmaku.id}_${danmaku.text}_${danmaku.time}';
      
      if (!_addedDanmakuIds.contains(uniqueKey)) {
        _addedDanmakuIds.add(uniqueKey);
        addedCount++;
        
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
    if (engine.particles.isNotEmpty) {
      final visibleParticles = engine.particles.where((p) => p.isVisible).toList();
      if (visibleParticles.isNotEmpty) {
        //debugPrint('🎨 Painting ${visibleParticles.length}/${engine.particles.length} - First: x=${visibleParticles[0].x.toStringAsFixed(1)}, y=${visibleParticles[0].y.toStringAsFixed(1)}, text="${visibleParticles[0].entity.text}"');
      }
    }
    
    for (var particle in engine.particles) {
      if (particle.isVisible) {
        try {
          _drawParticle(canvas, particle, globalOpacity);
        } catch (e) {
          debugPrint('❌ Error drawing particle: $e');
        }
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
    
    // 不透明度を適用（0 ~ 255の範囲）
    final alphaValue = (finalOpacity * 255).toInt().clamp(0, 255);

    // テキストスタイルを取得して不透明度を適用したバージョンを作成
    if (textPainter.text?.style != null) {
      final originalStyle = textPainter.text!.style!;
      final newStyle = originalStyle.copyWith(
        color: originalStyle.color?.withAlpha(alphaValue),
      );
      
      // 新しい TextPainter を作成
      final newTextPainter = TextPainter(
        text: TextSpan(
          text: textPainter.text!.toPlainText(),
          style: newStyle,
        ),
        textDirection: TextDirection.ltr,
      );
      newTextPainter.layout();
      newTextPainter.paint(canvas, const Offset(0, 0));
    } else {
      // フォールバック：オリジナルを描画
      textPainter.paint(canvas, const Offset(0, 0));
    }

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
