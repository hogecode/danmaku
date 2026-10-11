//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class VideoDownloadStatusResponseDto {
  /// Returns a new [VideoDownloadStatusResponseDto] instance.
  VideoDownloadStatusResponseDto({
    required this.jobId,
    required this.status,
    required this.videoId,
    this.progress,
    this.result,
  });

  String jobId;

  VideoDownloadStatusResponseDtoStatusEnum status;

  String videoId;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  VideoDownloadStatusResponseDtoProgress? progress;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  VideoDownloadStatusResponseDtoResult? result;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VideoDownloadStatusResponseDto &&
    other.jobId == jobId &&
    other.status == status &&
    other.videoId == videoId &&
    other.progress == progress &&
    other.result == result;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (jobId.hashCode) +
    (status.hashCode) +
    (videoId.hashCode) +
    (progress == null ? 0 : progress!.hashCode) +
    (result == null ? 0 : result!.hashCode);

  @override
  String toString() => 'VideoDownloadStatusResponseDto[jobId=$jobId, status=$status, videoId=$videoId, progress=$progress, result=$result]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'jobId'] = this.jobId;
      json[r'status'] = this.status;
      json[r'videoId'] = this.videoId;
    if (this.progress != null) {
      json[r'progress'] = this.progress;
    } else {
      json[r'progress'] = null;
    }
    if (this.result != null) {
      json[r'result'] = this.result;
    } else {
      json[r'result'] = null;
    }
    return json;
  }

  /// Returns a new [VideoDownloadStatusResponseDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VideoDownloadStatusResponseDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'jobId'), 'Required key "VideoDownloadStatusResponseDto[jobId]" is missing from JSON.');
        assert(json[r'jobId'] != null, 'Required key "VideoDownloadStatusResponseDto[jobId]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "VideoDownloadStatusResponseDto[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "VideoDownloadStatusResponseDto[status]" has a null value in JSON.');
        assert(json.containsKey(r'videoId'), 'Required key "VideoDownloadStatusResponseDto[videoId]" is missing from JSON.');
        assert(json[r'videoId'] != null, 'Required key "VideoDownloadStatusResponseDto[videoId]" has a null value in JSON.');
        return true;
      }());

      return VideoDownloadStatusResponseDto(
        jobId: mapValueOfType<String>(json, r'jobId')!,
        status: VideoDownloadStatusResponseDtoStatusEnum.fromJson(json[r'status'])!,
        videoId: mapValueOfType<String>(json, r'videoId')!,
        progress: VideoDownloadStatusResponseDtoProgress.fromJson(json[r'progress']),
        result: VideoDownloadStatusResponseDtoResult.fromJson(json[r'result']),
      );
    }
    return null;
  }

  static List<VideoDownloadStatusResponseDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadStatusResponseDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadStatusResponseDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VideoDownloadStatusResponseDto> mapFromJson(dynamic json) {
    final map = <String, VideoDownloadStatusResponseDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VideoDownloadStatusResponseDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VideoDownloadStatusResponseDto-objects as value to a dart map
  static Map<String, List<VideoDownloadStatusResponseDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VideoDownloadStatusResponseDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VideoDownloadStatusResponseDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'jobId',
    'status',
    'videoId',
  };
}


class VideoDownloadStatusResponseDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const VideoDownloadStatusResponseDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const completed = VideoDownloadStatusResponseDtoStatusEnum._(r'completed');
  static const failed = VideoDownloadStatusResponseDtoStatusEnum._(r'failed');
  static const queued = VideoDownloadStatusResponseDtoStatusEnum._(r'queued');
  static const notFound = VideoDownloadStatusResponseDtoStatusEnum._(r'not_found');
  static const processing = VideoDownloadStatusResponseDtoStatusEnum._(r'processing');

  /// List of all possible values in this [enum][VideoDownloadStatusResponseDtoStatusEnum].
  static const values = <VideoDownloadStatusResponseDtoStatusEnum>[
    completed,
    failed,
    queued,
    notFound,
    processing,
  ];

  static VideoDownloadStatusResponseDtoStatusEnum? fromJson(dynamic value) => VideoDownloadStatusResponseDtoStatusEnumTypeTransformer().decode(value);

  static List<VideoDownloadStatusResponseDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadStatusResponseDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadStatusResponseDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [VideoDownloadStatusResponseDtoStatusEnum] to String,
/// and [decode] dynamic data back to [VideoDownloadStatusResponseDtoStatusEnum].
class VideoDownloadStatusResponseDtoStatusEnumTypeTransformer {
  factory VideoDownloadStatusResponseDtoStatusEnumTypeTransformer() => _instance ??= const VideoDownloadStatusResponseDtoStatusEnumTypeTransformer._();

  const VideoDownloadStatusResponseDtoStatusEnumTypeTransformer._();

  String encode(VideoDownloadStatusResponseDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a VideoDownloadStatusResponseDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  VideoDownloadStatusResponseDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'completed': return VideoDownloadStatusResponseDtoStatusEnum.completed;
        case r'failed': return VideoDownloadStatusResponseDtoStatusEnum.failed;
        case r'queued': return VideoDownloadStatusResponseDtoStatusEnum.queued;
        case r'not_found': return VideoDownloadStatusResponseDtoStatusEnum.notFound;
        case r'processing': return VideoDownloadStatusResponseDtoStatusEnum.processing;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [VideoDownloadStatusResponseDtoStatusEnumTypeTransformer] instance.
  static VideoDownloadStatusResponseDtoStatusEnumTypeTransformer? _instance;
}


