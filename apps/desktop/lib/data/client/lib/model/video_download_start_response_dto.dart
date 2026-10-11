//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class VideoDownloadStartResponseDto {
  /// Returns a new [VideoDownloadStartResponseDto] instance.
  VideoDownloadStartResponseDto({
    required this.jobId,
    required this.videoId,
    required this.status,
    required this.message,
    this.estimatedTime,
  });

  String jobId;

  String videoId;

  VideoDownloadStartResponseDtoStatusEnum status;

  String message;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? estimatedTime;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VideoDownloadStartResponseDto &&
    other.jobId == jobId &&
    other.videoId == videoId &&
    other.status == status &&
    other.message == message &&
    other.estimatedTime == estimatedTime;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (jobId.hashCode) +
    (videoId.hashCode) +
    (status.hashCode) +
    (message.hashCode) +
    (estimatedTime == null ? 0 : estimatedTime!.hashCode);

  @override
  String toString() => 'VideoDownloadStartResponseDto[jobId=$jobId, videoId=$videoId, status=$status, message=$message, estimatedTime=$estimatedTime]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'jobId'] = this.jobId;
      json[r'videoId'] = this.videoId;
      json[r'status'] = this.status;
      json[r'message'] = this.message;
    if (this.estimatedTime != null) {
      json[r'estimatedTime'] = this.estimatedTime;
    } else {
      json[r'estimatedTime'] = null;
    }
    return json;
  }

  /// Returns a new [VideoDownloadStartResponseDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VideoDownloadStartResponseDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'jobId'), 'Required key "VideoDownloadStartResponseDto[jobId]" is missing from JSON.');
        assert(json[r'jobId'] != null, 'Required key "VideoDownloadStartResponseDto[jobId]" has a null value in JSON.');
        assert(json.containsKey(r'videoId'), 'Required key "VideoDownloadStartResponseDto[videoId]" is missing from JSON.');
        assert(json[r'videoId'] != null, 'Required key "VideoDownloadStartResponseDto[videoId]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "VideoDownloadStartResponseDto[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "VideoDownloadStartResponseDto[status]" has a null value in JSON.');
        assert(json.containsKey(r'message'), 'Required key "VideoDownloadStartResponseDto[message]" is missing from JSON.');
        assert(json[r'message'] != null, 'Required key "VideoDownloadStartResponseDto[message]" has a null value in JSON.');
        return true;
      }());

      return VideoDownloadStartResponseDto(
        jobId: mapValueOfType<String>(json, r'jobId')!,
        videoId: mapValueOfType<String>(json, r'videoId')!,
        status: VideoDownloadStartResponseDtoStatusEnum.fromJson(json[r'status'])!,
        message: mapValueOfType<String>(json, r'message')!,
        estimatedTime: num.parse('${json[r'estimatedTime']}'),
      );
    }
    return null;
  }

  static List<VideoDownloadStartResponseDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadStartResponseDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadStartResponseDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VideoDownloadStartResponseDto> mapFromJson(dynamic json) {
    final map = <String, VideoDownloadStartResponseDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VideoDownloadStartResponseDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VideoDownloadStartResponseDto-objects as value to a dart map
  static Map<String, List<VideoDownloadStartResponseDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VideoDownloadStartResponseDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VideoDownloadStartResponseDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'jobId',
    'videoId',
    'status',
    'message',
  };
}


class VideoDownloadStartResponseDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const VideoDownloadStartResponseDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const completed = VideoDownloadStartResponseDtoStatusEnum._(r'completed');
  static const failed = VideoDownloadStartResponseDtoStatusEnum._(r'failed');
  static const queued = VideoDownloadStartResponseDtoStatusEnum._(r'queued');
  static const processing = VideoDownloadStartResponseDtoStatusEnum._(r'processing');

  /// List of all possible values in this [enum][VideoDownloadStartResponseDtoStatusEnum].
  static const values = <VideoDownloadStartResponseDtoStatusEnum>[
    completed,
    failed,
    queued,
    processing,
  ];

  static VideoDownloadStartResponseDtoStatusEnum? fromJson(dynamic value) => VideoDownloadStartResponseDtoStatusEnumTypeTransformer().decode(value);

  static List<VideoDownloadStartResponseDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadStartResponseDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadStartResponseDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [VideoDownloadStartResponseDtoStatusEnum] to String,
/// and [decode] dynamic data back to [VideoDownloadStartResponseDtoStatusEnum].
class VideoDownloadStartResponseDtoStatusEnumTypeTransformer {
  factory VideoDownloadStartResponseDtoStatusEnumTypeTransformer() => _instance ??= const VideoDownloadStartResponseDtoStatusEnumTypeTransformer._();

  const VideoDownloadStartResponseDtoStatusEnumTypeTransformer._();

  String encode(VideoDownloadStartResponseDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a VideoDownloadStartResponseDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  VideoDownloadStartResponseDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'completed': return VideoDownloadStartResponseDtoStatusEnum.completed;
        case r'failed': return VideoDownloadStartResponseDtoStatusEnum.failed;
        case r'queued': return VideoDownloadStartResponseDtoStatusEnum.queued;
        case r'processing': return VideoDownloadStartResponseDtoStatusEnum.processing;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [VideoDownloadStartResponseDtoStatusEnumTypeTransformer] instance.
  static VideoDownloadStartResponseDtoStatusEnumTypeTransformer? _instance;
}


