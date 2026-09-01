import 'package:flutter/material.dart';

/// ダンマク種類
enum DanmakuType {
  right('right'),   // 右から左へ流動
  top('top'),       // 上部に固定
  bottom('bottom'); // 下部に固定

  final String value;
  const DanmakuType(this.value);

  factory DanmakuType.fromString(String value) {
    return DanmakuType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => DanmakuType.right,
    );
  }
}

/// ダンマクサイズ
enum DanmakuSize {
  big('big', 32.0),
  medium('medium', 24.0),
  small('small', 16.0);

  final String value;
  final double fontSize;

  const DanmakuSize(this.value, this.fontSize);

  factory DanmakuSize.fromString(String value) {
    return DanmakuSize.values.firstWhere(
      (e) => e.value == value,
      orElse: () => DanmakuSize.medium,
    );
  }
}

/// ダンマク Entity（ドメイン層）
class DanmakuEntity {
  /// コメント投稿時間（秒）
  final double time;

  /// コメント種類
  final DanmakuType type;

  /// カラー
  final Color color;

  /// 投稿者名
  final String author;

  /// コメントテキスト
  final String text;

  /// サイズ
  final DanmakuSize size;

  /// オプション ID
  final String? id;

  DanmakuEntity({
    required this.time,
    required this.type,
    required this.color,
    required this.author,
    required this.text,
    required this.size,
    this.id,
  });

  /// 画面表示時間（秒）
  double get durationSeconds => 8.0;

  /// 移動距離（ピクセル）
  double get distancePx => 1000.0;

  @override
  String toString() =>
      'DanmakuEntity(time: $time, type: $type, text: $text, author: $author, size: $size)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DanmakuEntity &&
          runtimeType == other.runtimeType &&
          time == other.time &&
          type == other.type &&
          author == other.author &&
          text == other.text;

  @override
  int get hashCode =>
      time.hashCode ^ type.hashCode ^ author.hashCode ^ text.hashCode;
}
