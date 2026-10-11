//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GetKakologCommentsRequestDto {
  /// Returns a new [GetKakologCommentsRequestDto] instance.
  GetKakologCommentsRequestDto({
    required this.channelId,
    required this.startTime,
    required this.endTime,
    this.limit,
  });

  String channelId;

  /// Minimum value: 0
  num startTime;

  /// Minimum value: 0
  num endTime;

  /// Minimum value: 1
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? limit;

  @override
  bool operator ==(Object other) => identical(this, other) || other is GetKakologCommentsRequestDto &&
    other.channelId == channelId &&
    other.startTime == startTime &&
    other.endTime == endTime &&
    other.limit == limit;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (channelId.hashCode) +
    (startTime.hashCode) +
    (endTime.hashCode) +
    (limit == null ? 0 : limit!.hashCode);

  @override
  String toString() => 'GetKakologCommentsRequestDto[channelId=$channelId, startTime=$startTime, endTime=$endTime, limit=$limit]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'channelId'] = this.channelId;
      json[r'startTime'] = this.startTime;
      json[r'endTime'] = this.endTime;
    if (this.limit != null) {
      json[r'limit'] = this.limit;
    } else {
      json[r'limit'] = null;
    }
    return json;
  }

  /// Returns a new [GetKakologCommentsRequestDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GetKakologCommentsRequestDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'channelId'), 'Required key "GetKakologCommentsRequestDto[channelId]" is missing from JSON.');
        assert(json[r'channelId'] != null, 'Required key "GetKakologCommentsRequestDto[channelId]" has a null value in JSON.');
        assert(json.containsKey(r'startTime'), 'Required key "GetKakologCommentsRequestDto[startTime]" is missing from JSON.');
        assert(json[r'startTime'] != null, 'Required key "GetKakologCommentsRequestDto[startTime]" has a null value in JSON.');
        assert(json.containsKey(r'endTime'), 'Required key "GetKakologCommentsRequestDto[endTime]" is missing from JSON.');
        assert(json[r'endTime'] != null, 'Required key "GetKakologCommentsRequestDto[endTime]" has a null value in JSON.');
        return true;
      }());

      return GetKakologCommentsRequestDto(
        channelId: mapValueOfType<String>(json, r'channelId')!,
        startTime: num.parse('${json[r'startTime']}'),
        endTime: num.parse('${json[r'endTime']}'),
        limit: num.parse('${json[r'limit']}'),
      );
    }
    return null;
  }

  static List<GetKakologCommentsRequestDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GetKakologCommentsRequestDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GetKakologCommentsRequestDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GetKakologCommentsRequestDto> mapFromJson(dynamic json) {
    final map = <String, GetKakologCommentsRequestDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GetKakologCommentsRequestDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GetKakologCommentsRequestDto-objects as value to a dart map
  static Map<String, List<GetKakologCommentsRequestDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GetKakologCommentsRequestDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GetKakologCommentsRequestDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'channelId',
    'startTime',
    'endTime',
  };
}

