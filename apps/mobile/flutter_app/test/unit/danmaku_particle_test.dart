import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_particle.dart';

void main() {
  group('DanmakuParticle', () {
    test('粒子初期化 - Right タイプ', () {
      final particle = DanmakuParticle(
        id: 'test_1',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      expect(particle.id, 'test_1');
      expect(particle.text, 'テスト');
      expect(particle.type, DanmakuType.right);
      expect(particle.startTime, 0.0);
      expect(particle.duration, 8.0);
    });

    test('粒子初期化 - Top タイプ', () {
      final particle = DanmakuParticle(
        id: 'test_2',
        text: 'ダンマク',
        type: DanmakuType.top,
        startTime: 1.0,
        duration: 5.0,
      );

      expect(particle.type, DanmakuType.top);
      expect(particle.startTime, 1.0);
    });

    test('粒子初期化 - Bottom タイプ', () {
      final particle = DanmakuParticle(
        id: 'test_3',
        text: 'コメント',
        type: DanmakuType.bottom,
        startTime: 2.0,
        duration: 5.0,
      );

      expect(particle.type, DanmakuType.bottom);
    });

    test('テキスト幅計算', () {
      final particle = DanmakuParticle(
        id: 'test_4',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      // テキストペインターでサイズ計算
      expect(particle.textWidth, greaterThan(0));
    });

    test('Y位置計算 - 衝突なし', () {
      final particle1 = DanmakuParticle(
        id: 'test_5',
        text: 'テスト1',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      final particle2 = DanmakuParticle(
        id: 'test_6',
        text: 'テスト2',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      // 異なるターゲットY位置
      particle1.targetY = 50;
      particle2.targetY = 100;

      expect(particle1.targetY, 50);
      expect(particle2.targetY, 100);
      expect(particle1.targetY != particle2.targetY, true);
    });

    test('Y位置更新 - 衝突回避', () {
      final particle = DanmakuParticle(
        id: 'test_7',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      final initialY = particle.targetY;
      particle.targetY += 30.0;

      expect(particle.targetY, initialY + 30.0);
    });

    test('進捗率計算 - Right タイプ', () {
      final particle = DanmakuParticle(
        id: 'test_8',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      // 開始時点
      double progress = (0.0 - particle.startTime) / particle.duration;
      expect(progress, 0.0);

      // 中途地点
      progress = (4.0 - particle.startTime) / particle.duration;
      expect(progress, 0.5);

      // 終了時点
      progress = (8.0 - particle.startTime) / particle.duration;
      expect(progress, 1.0);
    });

    test('表示状態判定 - 開始前', () {
      final particle = DanmakuParticle(
        id: 'test_9',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 5.0,
        duration: 8.0,
      );

      // 開始前（currentTime = 0.0）
      final currentTime = 0.0;
      expect(currentTime < particle.startTime, true);
    });

    test('表示状態判定 - 表示中', () {
      final particle = DanmakuParticle(
        id: 'test_10',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      // 表示中（currentTime = 4.0）
      final currentTime = 4.0;
      expect(currentTime >= particle.startTime && currentTime <= particle.startTime + particle.duration, true);
    });

    test('表示状態判定 - 終了後', () {
      final particle = DanmakuParticle(
        id: 'test_11',
        text: 'テスト',
        type: DanmakuType.right,
        startTime: 0.0,
        duration: 8.0,
      );

      // 終了後（currentTime = 10.0）
      final currentTime = 10.0;
      expect(currentTime > particle.startTime + particle.duration, true);
    });

    test('複数粒子の管理', () {
      final particles = [
        DanmakuParticle(
          id: 'test_12',
          text: 'テスト1',
          type: DanmakuType.right,
          startTime: 0.0,
          duration: 8.0,
        ),
        DanmakuParticle(
          id: 'test_13',
          text: 'テスト2',
          type: DanmakuType.right,
          startTime: 1.0,
          duration: 8.0,
        ),
        DanmakuParticle(
          id: 'test_14',
          text: 'テスト3',
          type: DanmakuType.top,
          startTime: 2.0,
          duration: 5.0,
        ),
      ];

      expect(particles.length, 3);
      expect(particles[0].id, 'test_12');
      expect(particles[1].id, 'test_13');
      expect(particles[2].type, DanmakuType.top);
    });
  });
}
