//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DownloadCommentWithDPlayerResponseDto {
  /// Returns a new [DownloadCommentWithDPlayerResponseDto] instance.
  DownloadCommentWithDPlayerResponseDto({
    required this.videoId,
    required this.status,
    required this.message,
    required this.data,
    required this.comments,
  });

  String videoId;

  DownloadCommentWithDPlayerResponseDtoStatusEnum status;

  String message;

  CommentDataDto data;

  CommentsContainerDto comments;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DownloadCommentWithDPlayerResponseDto &&
    other.videoId == videoId &&
    other.status == status &&
    other.message == message &&
    other.data == data &&
    other.comments == comments;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (videoId.hashCode) +
    (status.hashCode) +
    (message.hashCode) +
    (data.hashCode) +
    (comments.hashCode);

  @override
  String toString() => 'DownloadCommentWithDPlayerResponseDto[videoId=$videoId, status=$status, message=$message, data=$data, comments=$comments]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'videoId'] = this.videoId;
      json[r'status'] = this.status;
      json[r'message'] = this.message;
      json[r'data'] = this.data;
      json[r'comments'] = this.comments;
    return json;
  }

  /// Returns a new [DownloadCommentWithDPlayerResponseDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DownloadCommentWithDPlayerResponseDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'videoId'), 'Required key "DownloadCommentWithDPlayerResponseDto[videoId]" is missing from JSON.');
        assert(json[r'videoId'] != null, 'Required key "DownloadCommentWithDPlayerResponseDto[videoId]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "DownloadCommentWithDPlayerResponseDto[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "DownloadCommentWithDPlayerResponseDto[status]" has a null value in JSON.');
        assert(json.containsKey(r'message'), 'Required key "DownloadCommentWithDPlayerResponseDto[message]" is missing from JSON.');
        assert(json[r'message'] != null, 'Required key "DownloadCommentWithDPlayerResponseDto[message]" has a null value in JSON.');
        assert(json.containsKey(r'data'), 'Required key "DownloadCommentWithDPlayerResponseDto[data]" is missing from JSON.');
        assert(json[r'data'] != null, 'Required key "DownloadCommentWithDPlayerResponseDto[data]" has a null value in JSON.');
        assert(json.containsKey(r'comments'), 'Required key "DownloadCommentWithDPlayerResponseDto[comments]" is missing from JSON.');
        assert(json[r'comments'] != null, 'Required key "DownloadCommentWithDPlayerResponseDto[comments]" has a null value in JSON.');
        return true;
      }());

      return DownloadCommentWithDPlayerResponseDto(
        videoId: mapValueOfType<String>(json, r'videoId')!,
        status: DownloadCommentWithDPlayerResponseDtoStatusEnum.fromJson(json[r'status'])!,
        message: mapValueOfType<String>(json, r'message')!,
        data: CommentDataDto.fromJson(json[r'data'])!,
        comments: CommentsContainerDto.fromJson(json[r'comments'])!,
      );
    }
    return null;
  }

  static List<DownloadCommentWithDPlayerResponseDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DownloadCommentWithDPlayerResponseDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DownloadCommentWithDPlayerResponseDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DownloadCommentWithDPlayerResponseDto> mapFromJson(dynamic json) {
    final map = <String, DownloadCommentWithDPlayerResponseDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DownloadCommentWithDPlayerResponseDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DownloadCommentWithDPlayerResponseDto-objects as value to a dart map
  static Map<String, List<DownloadCommentWithDPlayerResponseDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DownloadCommentWithDPlayerResponseDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DownloadCommentWithDPlayerResponseDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'videoId',
    'status',
    'message',
    'data',
    'comments',
  };
}


class DownloadCommentWithDPlayerResponseDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const DownloadCommentWithDPlayerResponseDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const completed = DownloadCommentWithDPlayerResponseDtoStatusEnum._(r'completed');
  static const failed = DownloadCommentWithDPlayerResponseDtoStatusEnum._(r'failed');

  /// List of all possible values in this [enum][DownloadCommentWithDPlayerResponseDtoStatusEnum].
  static const values = <DownloadCommentWithDPlayerResponseDtoStatusEnum>[
    completed,
    failed,
  ];

  static DownloadCommentWithDPlayerResponseDtoStatusEnum? fromJson(dynamic value) => DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer().decode(value);

  static List<DownloadCommentWithDPlayerResponseDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DownloadCommentWithDPlayerResponseDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DownloadCommentWithDPlayerResponseDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [DownloadCommentWithDPlayerResponseDtoStatusEnum] to String,
/// and [decode] dynamic data back to [DownloadCommentWithDPlayerResponseDtoStatusEnum].
class DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer {
  factory DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer() => _instance ??= const DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer._();

  const DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer._();

  String encode(DownloadCommentWithDPlayerResponseDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a DownloadCommentWithDPlayerResponseDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  DownloadCommentWithDPlayerResponseDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'completed': return DownloadCommentWithDPlayerResponseDtoStatusEnum.completed;
        case r'failed': return DownloadCommentWithDPlayerResponseDtoStatusEnum.failed;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer] instance.
  static DownloadCommentWithDPlayerResponseDtoStatusEnumTypeTransformer? _instance;
}


