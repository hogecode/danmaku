//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class VideoDownloadCancelResponseDto {
  /// Returns a new [VideoDownloadCancelResponseDto] instance.
  VideoDownloadCancelResponseDto({
    required this.jobId,
    required this.message,
    this.status,
  });

  String jobId;

  String message;

  VideoDownloadCancelResponseDtoStatusEnum? status;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VideoDownloadCancelResponseDto &&
    other.jobId == jobId &&
    other.message == message &&
    other.status == status;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (jobId.hashCode) +
    (message.hashCode) +
    (status == null ? 0 : status!.hashCode);

  @override
  String toString() => 'VideoDownloadCancelResponseDto[jobId=$jobId, message=$message, status=$status]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'jobId'] = this.jobId;
      json[r'message'] = this.message;
    if (this.status != null) {
      json[r'status'] = this.status;
    } else {
      json[r'status'] = null;
    }
    return json;
  }

  /// Returns a new [VideoDownloadCancelResponseDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VideoDownloadCancelResponseDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'jobId'), 'Required key "VideoDownloadCancelResponseDto[jobId]" is missing from JSON.');
        assert(json[r'jobId'] != null, 'Required key "VideoDownloadCancelResponseDto[jobId]" has a null value in JSON.');
        assert(json.containsKey(r'message'), 'Required key "VideoDownloadCancelResponseDto[message]" is missing from JSON.');
        assert(json[r'message'] != null, 'Required key "VideoDownloadCancelResponseDto[message]" has a null value in JSON.');
        return true;
      }());

      return VideoDownloadCancelResponseDto(
        jobId: mapValueOfType<String>(json, r'jobId')!,
        message: mapValueOfType<String>(json, r'message')!,
        status: VideoDownloadCancelResponseDtoStatusEnum.fromJson(json[r'status']),
      );
    }
    return null;
  }

  static List<VideoDownloadCancelResponseDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadCancelResponseDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadCancelResponseDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VideoDownloadCancelResponseDto> mapFromJson(dynamic json) {
    final map = <String, VideoDownloadCancelResponseDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VideoDownloadCancelResponseDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VideoDownloadCancelResponseDto-objects as value to a dart map
  static Map<String, List<VideoDownloadCancelResponseDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VideoDownloadCancelResponseDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VideoDownloadCancelResponseDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'jobId',
    'message',
  };
}


class VideoDownloadCancelResponseDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const VideoDownloadCancelResponseDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const notFound = VideoDownloadCancelResponseDtoStatusEnum._(r'not_found');
  static const cancelled = VideoDownloadCancelResponseDtoStatusEnum._(r'cancelled');

  /// List of all possible values in this [enum][VideoDownloadCancelResponseDtoStatusEnum].
  static const values = <VideoDownloadCancelResponseDtoStatusEnum>[
    notFound,
    cancelled,
  ];

  static VideoDownloadCancelResponseDtoStatusEnum? fromJson(dynamic value) => VideoDownloadCancelResponseDtoStatusEnumTypeTransformer().decode(value);

  static List<VideoDownloadCancelResponseDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadCancelResponseDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadCancelResponseDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [VideoDownloadCancelResponseDtoStatusEnum] to String,
/// and [decode] dynamic data back to [VideoDownloadCancelResponseDtoStatusEnum].
class VideoDownloadCancelResponseDtoStatusEnumTypeTransformer {
  factory VideoDownloadCancelResponseDtoStatusEnumTypeTransformer() => _instance ??= const VideoDownloadCancelResponseDtoStatusEnumTypeTransformer._();

  const VideoDownloadCancelResponseDtoStatusEnumTypeTransformer._();

  String encode(VideoDownloadCancelResponseDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a VideoDownloadCancelResponseDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  VideoDownloadCancelResponseDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'not_found': return VideoDownloadCancelResponseDtoStatusEnum.notFound;
        case r'cancelled': return VideoDownloadCancelResponseDtoStatusEnum.cancelled;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [VideoDownloadCancelResponseDtoStatusEnumTypeTransformer] instance.
  static VideoDownloadCancelResponseDtoStatusEnumTypeTransformer? _instance;
}


