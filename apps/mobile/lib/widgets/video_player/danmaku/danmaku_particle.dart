import 'package:flutter/material.dart';

/// ダンマク粒子（個別のダンマク表示オブジェクト）
class DanmakuParticle {
  /// ダンマク Entity
  final DanmakuEntity entity;

  /// 画面上の X 座標
  double x;

  /// 画面上の Y 座標
  double y;

  /// 開始時刻（秒）
  final double startTime;

  /// テキストの幅（ピクセル）
  late double textWidth;

  /// テキストの高さ（ピクセル）
  late double textHeight;

  /// キャッシュされた TextPainter
  TextPainter? _cachedTextPainter;

  /// 表示フラグ
  bool isVisible;

  /// 不透明度（0.0 ~ 1.0）
  double opacity;

  /// ターゲット Y 座標（衝突回避用）
  double targetY;

  DanmakuParticle({
    required this.entity,
    required this.startTime,
    required double canvasHeight,
    required double canvasWidth,
  })  : x = canvasWidth,
        y = canvasHeight / 2,
        targetY = canvasHeight / 2,
        isVisible = true,
        opacity = 1.0 {
    _initializeTextPainter();
  }

  /// TextPainter を初期化
  void _initializeTextPainter() {
    final textPainter = _createTextPainter();
    textPainter.layout();
    textWidth = textPainter.width;
    textHeight = textPainter.height;
    _cachedTextPainter = textPainter;
  }

  /// TextPainter を作成
  TextPainter _createTextPainter() {
    final textSpan = TextSpan(
      text: entity.text,
      style: TextStyle(
        fontSize: entity.size.fontSize,
        color: entity.color,
        fontWeight: FontWeight.bold,
      ),
    );

    return TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
  }

  /// キャッシュされた TextPainter を取得
  TextPainter getOrCreateTextPainter() {
    if (_cachedTextPainter != null) {
      return _cachedTextPainter!;
    }

    final textPainter = _createTextPainter();
    textPainter.layout();
    _cachedTextPainter = textPainter;
    return textPainter;
  }

  /// 粒子をクリア
  void clear() {
    _cachedTextPainter = null;
  }

  @override
  String toString() =>
      'DanmakuParticle(text: ${entity.text}, type: ${entity.type}, x: $x, y: $y, visible: $isVisible)';
}

/// ダンマクエンティティ（最小限）
class DanmakuEntity {
  final String? id;
  final String text;
  final double time;
  final DanmakuType type;
  final Color color;
  final DanmakuSize size;
  final String? author;
  final bool? isPrivileged;

  const DanmakuEntity({
    this.id,
    required this.text,
    required this.time,
    this.type = const DanmakuType('right'),
    this.color = Colors.white,
    this.size = const DanmakuSize(fontSize: 16),
    this.author,
    this.isPrivileged,
  });

  @override
  String toString() =>
      'DanmakuEntity(text: $text, time: $time, type: ${type.value}, color: $color)';
}

/// ダンマクタイプ
class DanmakuType {
  final String value; // 'right', 'top', 'bottom'

  const DanmakuType(this.value);

  @override
  String toString() => value;
}

/// ダンマクサイズ
class DanmakuSize {
  final double fontSize;

  const DanmakuSize({this.fontSize = 16});

  @override
  String toString() => 'DanmakuSize(fontSize: $fontSize)';
}
