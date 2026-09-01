import 'package:json_annotation/json_annotation.dart';

part 'api_response_model.g.dart';

/// API レスポンス（ジェネリック）
@JsonSerializable(genericArgumentFactories: true)
class ApiResponseModel<T> {
  /// ステータスコード（0 = 成功）
  @JsonKey(name: 'code')
  final int code;

  /// エラーメッセージ
  @JsonKey(name: 'msg')
  final String? msg;

  /// ペイロード
  @JsonKey(name: 'data')
  final T? data;

  ApiResponseModel({
    required this.code,
    this.msg,
    this.data,
  });

  /// 成功判定
  bool get isSuccess => code == 0;

  /// エラー判定
  bool get isError => code != 0;

  factory ApiResponseModel.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) =>
      _$ApiResponseModelFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object Function(T value) toJsonT) =>
      _$ApiResponseModelToJson(this, toJsonT);

  @override
  String toString() =>
      'ApiResponseModel(code: $code, msg: $msg, data: $data)';
}
