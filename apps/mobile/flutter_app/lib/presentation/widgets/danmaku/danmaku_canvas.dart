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

  const DanmakuCanvas({
    Key? key,
    required this.currentTime,
    required this.globalOpacity,
    required this.globalSpeedRate,
  }) : super(key: key);

  @override
  ConsumerState<DanmakuCanvas> createState() => _DanmakuCanvasState();
}

class _DanmakuCanvasState extends ConsumerState<DanmakuCanvas> {
  late Logger _logger;
  late FetchDanmakuUseCase _fetchUseCase;
  DanmakuLaneManager? _laneManager;

  final List<_ActiveDanmaku> _activeDanmaku = [];
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

    _laneManager ??= DanmakuLaneManager(
      laneHeight: 50,
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
            laneHeight: 50,
            containerWidth: size.width,
            containerHeight: size.height,
            globalOpacity: widget.globalOpacity,
            globalSpeedRate: widget.globalSpeedRate,
            currentTime: widget.currentTime,
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

    for (final danmaku in danmakuList) {
      final id = danmaku.id ??
          '${danmaku.time}_${danmaku.author}_${danmaku.text}';

      if (_processedDanmakuIds.contains(id)) continue;
      if (widget.currentTime < danmaku.time) continue;
      if (widget.currentTime >
          danmaku.time + AppConstants.danmakuDisplayDurationSeconds + 0.5) {
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

}

