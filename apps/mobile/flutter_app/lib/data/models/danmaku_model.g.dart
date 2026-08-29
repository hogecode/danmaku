// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'danmaku_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DanmakuModel _$DanmakuModelFromJson(Map<String, dynamic> json) =>
    DanmakuModel(
      time: (json['time'] as num).toDouble(),
      type: json['type'] as String,
      color: json['color'] as String,
      author: json['author'] as String,
      text: json['text'] as String,
      size: json['size'] as String,
      id: json['id'] as String?,
      token: json['token'] as String?,
    );

Map<String, dynamic> _$DanmakuModelToJson(DanmakuModel instance) =>
    <String, dynamic>{
      'time': instance.time,
      'type': instance.type,
      'color': instance.color,
      'author': instance.author,
      'text': instance.text,
      'size': instance.size,
      'id': instance.id,
      'token': instance.token,
    };
