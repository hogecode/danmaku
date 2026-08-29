import 'package:flutter/material.dart';
import 'package:flutter_app/core/constants/app_constants.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_particle.dart';
import 'package:flutter_app/presentation/widgets/danmaku/collision_detector.dart';
import 'package:logger/logger.dart';

/// ダンマク描画エンジン
class DanmakuEngine {
  /// 全粒子リスト
  final List<DanmakuParticle> particles = [];

  /// コリジョン検出器
  late final CollisionDetector _collisionDetector;

  /// ロガー
  late final Logger _logger;

  /// グローバル不透明度（0.0 ~ 1.0）
  double globalOpacity;

  /// グローバル速度倍率（0.5 ~ 3.0）
  double globalSpeedRate;

  /// 最大同時表示数
  final int maxParticles;

  DanmakuEngine({
    this.globalOpacity = 1.0,
    this.globalSpeedRate = 1.0,
    this.maxParticles = AppConstants.maxDanmakuCount,
  }) {
    _collisionDetector = CollisionDetector();
    _logger = Logger();
  }

  /// ダンマクを追加
  void addDanmaku(DanmakuEntity danmaku, double currentTime, double canvasHeight, double canvasWidth) {
    // 最大数に達しました場合は古い粒子を削除
    if (particles.length >= maxParticles) {
      particles.removeAt(0);
      _logger.w(
        'Max danmaku count reached, removing oldest particle',
      );
    }

    final particle = DanmakuParticle(
      entity: danmaku,
      startTime: currentTime + danmaku.time,
      canvasHeight: canvasHeight,
      canvasWidth: canvasWidth,
    );

    particles.add(particle);
  }

  /// フレームを計算（毎フレーム呼び出し）
  void calculateFrame(double currentTime, double canvasHeight, double canvasWidth) {
    // 各粒子の位置を更新
    for (var particle in particles) {
      _updateParticlePosition(particle, currentTime, canvasWidth, canvasHeight);
    }

    // 衝突検出・解決
    _collisionDetector.detectAndResolveCollisions(particles);

    // 画面外の粒子を削除
    particles.removeWhere((p) => !p.isVisible);
  }

  /// 粒子の位置を更新
  void _updateParticlePosition(
    DanmakuParticle particle,
    double currentTime,
    double canvasWidth,
    double canvasHeight,
  ) {
    final typeValue = particle.entity.type.value;

    if (typeValue == 'right') {
      _updateRightDanmaku(particle, currentTime, canvasWidth);
    } else if (typeValue == 'top') {
      _updateTopDanmaku(particle, currentTime);
    } else if (typeValue == 'bottom') {
      _updateBottomDanmaku(particle, currentTime, canvasHeight);
    }
  }

  /// Right タイプ（右→左）の位置を更新
  void _updateRightDanmaku(
    DanmakuParticle particle,
    double currentTime,
    double canvasWidth,
  ) {
    // 経過時間を計算
    final elapsed = currentTime - particle.startTime;

    // まだ表示時刻でない
    if (elapsed < 0) {
      particle.isVisible = false;
      return;
    }

    // 進捗率（0.0 ~ 1.0）
    final progress = elapsed / AppConstants.danmakuDurationSeconds;

    // X 座標を計算（右から左へ移動）
    particle.x = canvasWidth -
        (progress * (canvasWidth + particle.textWidth)) * globalSpeedRate;

    // Y 座標を設定
    particle.y = particle.targetY;

    // 画面外判定
    if (progress >= 1.0) {
      particle.isVisible = false;
    } else {
      particle.isVisible = true;
    }
  }

  /// Top タイプ（上部固定）の位置を更新
  void _updateTopDanmaku(DanmakuParticle particle, double currentTime) {
    final elapsed = currentTime - particle.startTime;

    if (elapsed < 0) {
      particle.isVisible = false;
      return;
    }

    // 表示期間内か判定
    final totalDuration = AppConstants.danmakuDurationSeconds + 0.5; // フェードアウト時間
    if (elapsed > totalDuration) {
      particle.isVisible = false;
      return;
    }

    // フェードアウト期間を計算
    if (elapsed > AppConstants.danmakuDurationSeconds) {
      final fadeElapsed = elapsed - AppConstants.danmakuDurationSeconds;
      particle.opacity = 1.0 - (fadeElapsed / 0.5);
    } else {
      particle.opacity = 1.0;
    }

    particle.isVisible = true;
  }

  /// Bottom タイプ（下部固定）の位置を更新
  void _updateBottomDanmaku(
    DanmakuParticle particle,
    double currentTime,
    double canvasHeight,
  ) {
    final elapsed = currentTime - particle.startTime;

    if (elapsed < 0) {
      particle.isVisible = false;
      return;
    }

    // 表示期間内か判定
    final totalDuration = AppConstants.danmakuDurationSeconds + 0.5;
    if (elapsed > totalDuration) {
      particle.isVisible = false;
      return;
    }

    // Y 座標を設定（下部）
    particle.y = canvasHeight - particle.textHeight - 20;

    // フェードアウト期間を計算
    if (elapsed > AppConstants.danmakuDurationSeconds) {
      final fadeElapsed = elapsed - AppConstants.danmakuDurationSeconds;
      particle.opacity = 1.0 - (fadeElapsed / 0.5);
    } else {
      particle.opacity = 1.0;
    }

    particle.isVisible = true;
  }

  /// すべてのダンマクをクリア
  void clear() {
    particles.clear();
  }

  /// ダンマク数を取得
  int getParticleCount() => particles.length;

  /// 統計情報を取得
  String getStats() {
    final visibleCount = particles.where((p) => p.isVisible).length;
    return 'Particles: ${particles.length}, Visible: $visibleCount, Opacity: $globalOpacity, Speed: ${globalSpeedRate}x';
  }
}
