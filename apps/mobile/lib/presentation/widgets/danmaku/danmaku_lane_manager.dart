import 'package:flutter/material.dart';
import 'package:mobile/domain/entities/danmaku_entity.dart';

/// ダンマクのレーン（トンネル）を管理
/// 同じレーンのダンマクが重ならないようにする
class DanmakuLaneManager {
  /// レーン情報: type -> lane_index -> 最後に割り当てたダンマクの開始時刻
  final Map<String, Map<int, double>> laneLastTime = {
    'right': {},
    'top': {},
    'bottom': {},
  };

  /// レーンの高さ（ピクセル）
  final double laneHeight;

  /// コンテナの高さ
  final double containerHeight;

  /// ダンマク表示時間（秒）
  final double displayDuration;

  /// ダンマク移動時間（秒）
  final double movementDuration;

  DanmakuLaneManager({
    required this.laneHeight,
    required this.containerHeight,
    this.displayDuration = 6.0,
    this.movementDuration = 6.0,
  });

  /// 利用可能なレーンの総数
  int get maxLanes => (containerHeight / laneHeight).ceil();

  /// ダンマクを追加して、割り当てられたレーンインデックスを取得
  int assignLane(DanmakuEntity danmaku, String type) {
    if (!laneLastTime.containsKey(type)) {
      laneLastTime[type] = {};
    }

    final typeLanes = laneLastTime[type]!;

    // 最初に空いているレーンを探す
    for (int i = 0; i < maxLanes; i++) {
      if (!typeLanes.containsKey(i)) {
        // 未使用のレーン
        typeLanes[i] = danmaku.time;
        return i;
      }

      // レーン内の最後のダンマクがどのくらい進んでいるかチェック
      // right タイプは移動時間を考慮
      final lastTime = typeLanes[i]!;
      final requiredGap = type == 'right' ? movementDuration + 0.5 : 1.0;

      if (danmaku.time - lastTime >= requiredGap) {
        // 十分に進んでいるので、このレーンを再利用
        typeLanes[i] = danmaku.time;
        return i;
      }
    }

    // レーンがいっぱいの場合、最も古いレーンをリセット
    var oldestLane = 0;
    var oldestTime = typeLanes[0]!;
    for (int i = 1; i < maxLanes; i++) {
      if ((typeLanes[i] ?? double.infinity) < oldestTime) {
        oldestTime = typeLanes[i]!;
        oldestLane = i;
      }
    }
    typeLanes[oldestLane] = danmaku.time;
    return oldestLane;
  }

  /// すべてのレーンをクリア
  void clear() {
    laneLastTime.forEach((type, typeLanes) {
      typeLanes.clear();
    });
  }
}
