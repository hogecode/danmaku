//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class VideoDownloadStatusResponseDtoResult {
  /// Returns a new [VideoDownloadStatusResponseDtoResult] instance.
  VideoDownloadStatusResponseDtoResult({
    required this.fileName,
    required this.s3Key,
    required this.s3Url,
    required this.fileSize,
    required this.duration,
    required this.title,
    this.commentCount,
    required this.completedAt,
  });

  String fileName;

  String s3Key;

  String s3Url;

  num fileSize;

  num duration;

  String title;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? commentCount;

  String completedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VideoDownloadStatusResponseDtoResult &&
    other.fileName == fileName &&
    other.s3Key == s3Key &&
    other.s3Url == s3Url &&
    other.fileSize == fileSize &&
    other.duration == duration &&
    other.title == title &&
    other.commentCount == commentCount &&
    other.completedAt == completedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (fileName.hashCode) +
    (s3Key.hashCode) +
    (s3Url.hashCode) +
    (fileSize.hashCode) +
    (duration.hashCode) +
    (title.hashCode) +
    (commentCount == null ? 0 : commentCount!.hashCode) +
    (completedAt.hashCode);

  @override
  String toString() => 'VideoDownloadStatusResponseDtoResult[fileName=$fileName, s3Key=$s3Key, s3Url=$s3Url, fileSize=$fileSize, duration=$duration, title=$title, commentCount=$commentCount, completedAt=$completedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'fileName'] = this.fileName;
      json[r's3Key'] = this.s3Key;
      json[r's3Url'] = this.s3Url;
      json[r'fileSize'] = this.fileSize;
      json[r'duration'] = this.duration;
      json[r'title'] = this.title;
    if (this.commentCount != null) {
      json[r'commentCount'] = this.commentCount;
    } else {
      json[r'commentCount'] = null;
    }
      json[r'completedAt'] = this.completedAt;
    return json;
  }

  /// Returns a new [VideoDownloadStatusResponseDtoResult] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VideoDownloadStatusResponseDtoResult? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'fileName'), 'Required key "VideoDownloadStatusResponseDtoResult[fileName]" is missing from JSON.');
        assert(json[r'fileName'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[fileName]" has a null value in JSON.');
        assert(json.containsKey(r's3Key'), 'Required key "VideoDownloadStatusResponseDtoResult[s3Key]" is missing from JSON.');
        assert(json[r's3Key'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[s3Key]" has a null value in JSON.');
        assert(json.containsKey(r's3Url'), 'Required key "VideoDownloadStatusResponseDtoResult[s3Url]" is missing from JSON.');
        assert(json[r's3Url'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[s3Url]" has a null value in JSON.');
        assert(json.containsKey(r'fileSize'), 'Required key "VideoDownloadStatusResponseDtoResult[fileSize]" is missing from JSON.');
        assert(json[r'fileSize'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[fileSize]" has a null value in JSON.');
        assert(json.containsKey(r'duration'), 'Required key "VideoDownloadStatusResponseDtoResult[duration]" is missing from JSON.');
        assert(json[r'duration'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[duration]" has a null value in JSON.');
        assert(json.containsKey(r'title'), 'Required key "VideoDownloadStatusResponseDtoResult[title]" is missing from JSON.');
        assert(json[r'title'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[title]" has a null value in JSON.');
        assert(json.containsKey(r'completedAt'), 'Required key "VideoDownloadStatusResponseDtoResult[completedAt]" is missing from JSON.');
        assert(json[r'completedAt'] != null, 'Required key "VideoDownloadStatusResponseDtoResult[completedAt]" has a null value in JSON.');
        return true;
      }());

      return VideoDownloadStatusResponseDtoResult(
        fileName: mapValueOfType<String>(json, r'fileName')!,
        s3Key: mapValueOfType<String>(json, r's3Key')!,
        s3Url: mapValueOfType<String>(json, r's3Url')!,
        fileSize: num.parse('${json[r'fileSize']}'),
        duration: num.parse('${json[r'duration']}'),
        title: mapValueOfType<String>(json, r'title')!,
        commentCount: num.parse('${json[r'commentCount']}'),
        completedAt: mapValueOfType<String>(json, r'completedAt')!,
      );
    }
    return null;
  }

  static List<VideoDownloadStatusResponseDtoResult> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadStatusResponseDtoResult>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadStatusResponseDtoResult.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VideoDownloadStatusResponseDtoResult> mapFromJson(dynamic json) {
    final map = <String, VideoDownloadStatusResponseDtoResult>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VideoDownloadStatusResponseDtoResult.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VideoDownloadStatusResponseDtoResult-objects as value to a dart map
  static Map<String, List<VideoDownloadStatusResponseDtoResult>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VideoDownloadStatusResponseDtoResult>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VideoDownloadStatusResponseDtoResult.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'fileName',
    's3Key',
    's3Url',
    'fileSize',
    'duration',
    'title',
    'completedAt',
  };
}

