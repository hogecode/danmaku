import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/presentation/widgets/danmaku/danmaku_particle.dart';
import 'package:logger/logger.dart';

/// コリジョン検出・回避エンジン
class CollisionDetector {
  late final Logger _logger;

  CollisionDetector() {
    _logger = Logger();
  }

  /// すべての衝突を検出・解決
  void detectAndResolveCollisions(List<DanmakuParticle> particles) {
    // Right タイプのダンマクのみ処理
    final rightDanmaku = particles
        .where((p) => p.entity.type.value == 'right' && p.isVisible)
        .toList();

    if (rightDanmaku.length < 2) {
      return; // 衝突検出の必要なし
    }

    // 2重ループで全ペアをチェック
    for (int i = 0; i < rightDanmaku.length; i++) {
      for (int j = i + 1; j < rightDanmaku.length; j++) {
        if (_isColliding(rightDanmaku[i], rightDanmaku[j])) {
          _resolveCollision(rightDanmaku[i], rightDanmaku[j]);
        }
      }
    }
  }

  /// 2 つの粒子が衝突しているか判定
  bool _isColliding(DanmakuParticle a, DanmakuParticle b) {
    // 軌道が異なる場合は衝突しない
    if ((a.targetY - b.targetY).abs() > AppConstants.danmakuLineHeight) {
      return false;
    }

    // 水平距離で衝突判定
    final minDist =
        a.textWidth + b.textWidth + AppConstants.danmakuCollisionMargin;
    final distance = (a.x - b.x).abs();

    return distance < minDist;
  }

  /// 衝突を解決（粒子を上下にシフト）
  void _resolveCollision(DanmakuParticle a, DanmakuParticle b) {
    // 後に追加された粒子（開始時刻が遅い）を下にシフト
    if (a.startTime > b.startTime) {
      a.targetY += AppConstants.danmakuLineHeight;
    } else {
      b.targetY += AppConstants.danmakuLineHeight;
    }
  }
}
