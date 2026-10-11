//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GetKakologCommentsResponseDto {
  /// Returns a new [GetKakologCommentsResponseDto] instance.
  GetKakologCommentsResponseDto({
    required this.status,
    this.message,
    required this.channelId,
    required this.startTime,
    required this.endTime,
    required this.commentCount,
    required this.retrievedCount,
    this.comments = const [],
  });

  GetKakologCommentsResponseDtoStatusEnum status;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? message;

  String channelId;

  num startTime;

  num endTime;

  num commentCount;

  num retrievedCount;

  List<KakologCommentDto> comments;

  @override
  bool operator ==(Object other) => identical(this, other) || other is GetKakologCommentsResponseDto &&
    other.status == status &&
    other.message == message &&
    other.channelId == channelId &&
    other.startTime == startTime &&
    other.endTime == endTime &&
    other.commentCount == commentCount &&
    other.retrievedCount == retrievedCount &&
    _deepEquality.equals(other.comments, comments);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (status.hashCode) +
    (message == null ? 0 : message!.hashCode) +
    (channelId.hashCode) +
    (startTime.hashCode) +
    (endTime.hashCode) +
    (commentCount.hashCode) +
    (retrievedCount.hashCode) +
    (comments.hashCode);

  @override
  String toString() => 'GetKakologCommentsResponseDto[status=$status, message=$message, channelId=$channelId, startTime=$startTime, endTime=$endTime, commentCount=$commentCount, retrievedCount=$retrievedCount, comments=$comments]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'status'] = this.status;
    if (this.message != null) {
      json[r'message'] = this.message;
    } else {
      json[r'message'] = null;
    }
      json[r'channelId'] = this.channelId;
      json[r'startTime'] = this.startTime;
      json[r'endTime'] = this.endTime;
      json[r'commentCount'] = this.commentCount;
      json[r'retrievedCount'] = this.retrievedCount;
      json[r'comments'] = this.comments;
    return json;
  }

  /// Returns a new [GetKakologCommentsResponseDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GetKakologCommentsResponseDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'status'), 'Required key "GetKakologCommentsResponseDto[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "GetKakologCommentsResponseDto[status]" has a null value in JSON.');
        assert(json.containsKey(r'channelId'), 'Required key "GetKakologCommentsResponseDto[channelId]" is missing from JSON.');
        assert(json[r'channelId'] != null, 'Required key "GetKakologCommentsResponseDto[channelId]" has a null value in JSON.');
        assert(json.containsKey(r'startTime'), 'Required key "GetKakologCommentsResponseDto[startTime]" is missing from JSON.');
        assert(json[r'startTime'] != null, 'Required key "GetKakologCommentsResponseDto[startTime]" has a null value in JSON.');
        assert(json.containsKey(r'endTime'), 'Required key "GetKakologCommentsResponseDto[endTime]" is missing from JSON.');
        assert(json[r'endTime'] != null, 'Required key "GetKakologCommentsResponseDto[endTime]" has a null value in JSON.');
        assert(json.containsKey(r'commentCount'), 'Required key "GetKakologCommentsResponseDto[commentCount]" is missing from JSON.');
        assert(json[r'commentCount'] != null, 'Required key "GetKakologCommentsResponseDto[commentCount]" has a null value in JSON.');
        assert(json.containsKey(r'retrievedCount'), 'Required key "GetKakologCommentsResponseDto[retrievedCount]" is missing from JSON.');
        assert(json[r'retrievedCount'] != null, 'Required key "GetKakologCommentsResponseDto[retrievedCount]" has a null value in JSON.');
        assert(json.containsKey(r'comments'), 'Required key "GetKakologCommentsResponseDto[comments]" is missing from JSON.');
        assert(json[r'comments'] != null, 'Required key "GetKakologCommentsResponseDto[comments]" has a null value in JSON.');
        return true;
      }());

      return GetKakologCommentsResponseDto(
        status: GetKakologCommentsResponseDtoStatusEnum.fromJson(json[r'status'])!,
        message: mapValueOfType<String>(json, r'message'),
        channelId: mapValueOfType<String>(json, r'channelId')!,
        startTime: num.parse('${json[r'startTime']}'),
        endTime: num.parse('${json[r'endTime']}'),
        commentCount: num.parse('${json[r'commentCount']}'),
        retrievedCount: num.parse('${json[r'retrievedCount']}'),
        comments: KakologCommentDto.listFromJson(json[r'comments']),
      );
    }
    return null;
  }

  static List<GetKakologCommentsResponseDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GetKakologCommentsResponseDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GetKakologCommentsResponseDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GetKakologCommentsResponseDto> mapFromJson(dynamic json) {
    final map = <String, GetKakologCommentsResponseDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GetKakologCommentsResponseDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GetKakologCommentsResponseDto-objects as value to a dart map
  static Map<String, List<GetKakologCommentsResponseDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GetKakologCommentsResponseDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GetKakologCommentsResponseDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'status',
    'channelId',
    'startTime',
    'endTime',
    'commentCount',
    'retrievedCount',
    'comments',
  };
}


class GetKakologCommentsResponseDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const GetKakologCommentsResponseDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const completed = GetKakologCommentsResponseDtoStatusEnum._(r'completed');
  static const failed = GetKakologCommentsResponseDtoStatusEnum._(r'failed');

  /// List of all possible values in this [enum][GetKakologCommentsResponseDtoStatusEnum].
  static const values = <GetKakologCommentsResponseDtoStatusEnum>[
    completed,
    failed,
  ];

  static GetKakologCommentsResponseDtoStatusEnum? fromJson(dynamic value) => GetKakologCommentsResponseDtoStatusEnumTypeTransformer().decode(value);

  static List<GetKakologCommentsResponseDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GetKakologCommentsResponseDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GetKakologCommentsResponseDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [GetKakologCommentsResponseDtoStatusEnum] to String,
/// and [decode] dynamic data back to [GetKakologCommentsResponseDtoStatusEnum].
class GetKakologCommentsResponseDtoStatusEnumTypeTransformer {
  factory GetKakologCommentsResponseDtoStatusEnumTypeTransformer() => _instance ??= const GetKakologCommentsResponseDtoStatusEnumTypeTransformer._();

  const GetKakologCommentsResponseDtoStatusEnumTypeTransformer._();

  String encode(GetKakologCommentsResponseDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a GetKakologCommentsResponseDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  GetKakologCommentsResponseDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'completed': return GetKakologCommentsResponseDtoStatusEnum.completed;
        case r'failed': return GetKakologCommentsResponseDtoStatusEnum.failed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [GetKakologCommentsResponseDtoStatusEnumTypeTransformer] instance.
  static GetKakologCommentsResponseDtoStatusEnumTypeTransformer? _instance;
}


