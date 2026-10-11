//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class VideoDownloadStatusResponseDtoProgress {
  /// Returns a new [VideoDownloadStatusResponseDtoProgress] instance.
  VideoDownloadStatusResponseDtoProgress({
    required this.step,
    required this.percentage,
    required this.message,
  });

  String step;

  num percentage;

  String message;

  @override
  bool operator ==(Object other) => identical(this, other) || other is VideoDownloadStatusResponseDtoProgress &&
    other.step == step &&
    other.percentage == percentage &&
    other.message == message;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (step.hashCode) +
    (percentage.hashCode) +
    (message.hashCode);

  @override
  String toString() => 'VideoDownloadStatusResponseDtoProgress[step=$step, percentage=$percentage, message=$message]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'step'] = this.step;
      json[r'percentage'] = this.percentage;
      json[r'message'] = this.message;
    return json;
  }

  /// Returns a new [VideoDownloadStatusResponseDtoProgress] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static VideoDownloadStatusResponseDtoProgress? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'step'), 'Required key "VideoDownloadStatusResponseDtoProgress[step]" is missing from JSON.');
        assert(json[r'step'] != null, 'Required key "VideoDownloadStatusResponseDtoProgress[step]" has a null value in JSON.');
        assert(json.containsKey(r'percentage'), 'Required key "VideoDownloadStatusResponseDtoProgress[percentage]" is missing from JSON.');
        assert(json[r'percentage'] != null, 'Required key "VideoDownloadStatusResponseDtoProgress[percentage]" has a null value in JSON.');
        assert(json.containsKey(r'message'), 'Required key "VideoDownloadStatusResponseDtoProgress[message]" is missing from JSON.');
        assert(json[r'message'] != null, 'Required key "VideoDownloadStatusResponseDtoProgress[message]" has a null value in JSON.');
        return true;
      }());

      return VideoDownloadStatusResponseDtoProgress(
        step: mapValueOfType<String>(json, r'step')!,
        percentage: num.parse('${json[r'percentage']}'),
        message: mapValueOfType<String>(json, r'message')!,
      );
    }
    return null;
  }

  static List<VideoDownloadStatusResponseDtoProgress> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <VideoDownloadStatusResponseDtoProgress>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = VideoDownloadStatusResponseDtoProgress.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, VideoDownloadStatusResponseDtoProgress> mapFromJson(dynamic json) {
    final map = <String, VideoDownloadStatusResponseDtoProgress>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = VideoDownloadStatusResponseDtoProgress.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of VideoDownloadStatusResponseDtoProgress-objects as value to a dart map
  static Map<String, List<VideoDownloadStatusResponseDtoProgress>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<VideoDownloadStatusResponseDtoProgress>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = VideoDownloadStatusResponseDtoProgress.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'step',
    'percentage',
    'message',
  };
}

