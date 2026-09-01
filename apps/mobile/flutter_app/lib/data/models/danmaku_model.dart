import 'package:json_annotation/json_annotation.dart';

part 'danmaku_model.g.dart';

/// ダンマクAPI用モデル
// TODO: 後で変更する
@JsonSerializable()
class DanmakuModel {
  /// コメント投稿時間（秒）
  @JsonKey(name: 'time')
  final double time;

  /// コメント種類: 'right'|'top'|'bottom'
  @JsonKey(name: 'type')
  final String type;

  /// RGB または HEX カラーコード（例: #ffeaea）
  @JsonKey(name: 'color')
  final String color;

  /// 投稿者名
  @JsonKey(name: 'author')
  final String author;

  /// コメントテキスト
  @JsonKey(name: 'text')
  final String text;

  /// サイズ: 'big'|'medium'|'small'
  @JsonKey(name: 'size')
  final String size;

  /// 一意なID（オプション）
  @JsonKey(name: 'id')
  final String? id;

  /// トークン（認証用、後実装）
  @JsonKey(name: 'token')
  final String? token;

  DanmakuModel({
    required this.time,
    required this.type,
    required this.color,
    required this.author,
    required this.text,
    required this.size,
    this.id,
    this.token,
  });

  factory DanmakuModel.fromJson(Map<String, dynamic> json) =>
      _$DanmakuModelFromJson(json);

  Map<String, dynamic> toJson() => _$DanmakuModelToJson(this);

  @override
  String toString() =>
      'DanmakuModel(time: $time, type: $type, text: $text, author: $author, color: $color, size: $size)';
}
