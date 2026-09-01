import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/app_constants.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';
import 'package:flutter_app/domain/usecases/fetch_danmaku_usecase.dart';
import 'package:flutter_app/presentation/notifiers/danmaku_notifier.dart';
import 'package:flutter_app/presentation/providers/app_provider.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_item_widget.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_lane_manager.dart';
import 'package:logger/logger.dart';

class _ActiveDanmaku {
  final DanmakuEntity danmaku;
  final int laneIndex;

  const _ActiveDanmaku({
    required this.danmaku,
    required this.laneIndex,
  });
}


class DanmakuCanvas extends ConsumerStatefulWidget {
  final double currentTime;
  final double globalOpacity;
  final double globalSpeedRate;
  final bool isPaused;

  const DanmakuCanvas({
    Key? key,
    required this.currentTime,
    required this.globalOpacity,
    required this.globalSpeedRate,
    required this.isPaused,
  }) : super(key: key);

  @override
  ConsumerState<DanmakuCanvas> createState() => _DanmakuCanvasState();
}


class _DanmakuCanvasState extends ConsumerState<DanmakuCanvas> {
  late Logger _logger;
  late FetchDanmakuUseCase _fetchUseCase;
  DanmakuLaneManager? _laneManager;

  // アクティブなダンマクのリスト
  final List<_ActiveDanmaku> _activeDanmaku = [];
  // すでに処理済みのダンマクIDのセット
  final Set<String> _processedDanmakuIds = {};

  @override
  void initState() {
    super.initState();
    _logger = Logger();
    _fetchUseCase = ref.read(fetchDanmakuUseCaseProvider);
  }

  @override
  void dispose() {
    _activeDanmaku.clear();
    _processedDanmakuIds.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    // DanmakuLaneManager を初期化（高さとコンテナサイズを指定）
    _laneManager ??= DanmakuLaneManager(
      laneHeight: AppConstants.danmakuLineHeight,
      containerHeight: size.height,
    );

    final danmakuState = ref.watch(
      danmakuStateProvider(_fetchUseCase),
    );

    // 新しいダンマクをチェック（animation が自動で動かすので、ここでは追加判定のみ）
    _updateDanmaku(danmakuState.danmakuList);

    return Stack(
      children: [
        ..._activeDanmaku.map((item) {
          final id = item.danmaku.id ??
              '${item.danmaku.time}_${item.danmaku.author}_${item.danmaku.text}';

          return DanmakuItemWidget(
            key: ValueKey(id),
            danmaku: item.danmaku,
            laneIndex: item.laneIndex,
            laneHeight: AppConstants.danmakuLineHeight,
            containerWidth: size.width,
            containerHeight: size.height,
            globalOpacity: widget.globalOpacity,
            globalSpeedRate: widget.globalSpeedRate,
            currentTime: widget.currentTime,
            isPaused: widget.isPaused,
            onRemove: () {
              if (!mounted) return;
              final removeId = item.danmaku.id ??
                  '${item.danmaku.time}_${item.danmaku.author}_${item.danmaku.text}';

              setState(() {
                _activeDanmaku.removeWhere((a) =>
                    (a.danmaku.id ??
                        '${a.danmaku.time}_${a.danmaku.author}_${a.danmaku.text}') ==
                    removeId);
              });
            },
          );
        }).toList(),
      ],
    );
  }

  void _updateDanmaku(List<DanmakuEntity> danmakuList) {
    if (!mounted || _laneManager == null) return;

    final newDanmaku = <_ActiveDanmaku>[];
    final displayDuration = AppConstants.danmakuDisplayDurationSeconds;

    for (final danmaku in danmakuList) {
      final id = danmaku.id ??
          '${danmaku.time}_${danmaku.author}_${danmaku.text}';

      // 既に処理済みの場合はスキップ（重複防止）
      if (_processedDanmakuIds.contains(id)) continue;

      // コメント開始時刻より前の場合はスキップ（まだ表示時間ではない）
      if (widget.currentTime < danmaku.time) continue;
      
      // コメント終了時刻を超えている場合はスキップ（表示完了済み）
      if (widget.currentTime > danmaku.time + displayDuration + 0.5) {
        continue;
      }

      final laneIndex =
          _laneManager!.assignLane(danmaku, danmaku.type.value);
      if (laneIndex < 0) continue;

      _processedDanmakuIds.add(id);
      newDanmaku.add(_ActiveDanmaku(danmaku: danmaku, laneIndex: laneIndex));
    }

    if (newDanmaku.isNotEmpty) {
      setState(() {
        _activeDanmaku.addAll(newDanmaku);
      });
    }
  }

  /// DPlayer の clear() 実装を参考した、シーク時のクリア
  void _clearExpiredDanmaku() {
    if (!mounted) return;
    
    final displayDuration = AppConstants.danmakuDisplayDurationSeconds;
    
    setState(() {
      // 表示期限切れのコメントを削除
      final idsToRemove = <String>{};
      _activeDanmaku.removeWhere((item) {
        final endTime = item.danmaku.time + displayDuration + 0.5;
        final isExpired = widget.currentTime > endTime;
        if (isExpired) {
          final id = item.danmaku.id ??
              '${item.danmaku.time}_${item.danmaku.author}_${item.danmaku.text}';
          idsToRemove.add(id);
        }
        return isExpired;
      });
      
      // 削除されたコメントを processed から削除
      _processedDanmakuIds.removeAll(idsToRemove);
    });
  }

  @override
  void didUpdateWidget(DanmakuCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    // DPlayer の seek() 実装を参考：シーク時（currentTime が大きく変わった）
    if ((widget.currentTime - oldWidget.currentTime).abs() > 0.5) {
      _clearExpiredDanmaku();
    }
  }

}

