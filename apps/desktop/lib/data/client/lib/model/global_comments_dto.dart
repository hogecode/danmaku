//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class GlobalCommentsDto {
  /// Returns a new [GlobalCommentsDto] instance.
  GlobalCommentsDto({
    required this.commentCount,
    required this.retrievedCount,
  });

  num commentCount;

  num retrievedCount;

  @override
  bool operator ==(Object other) => identical(this, other) || other is GlobalCommentsDto &&
    other.commentCount == commentCount &&
    other.retrievedCount == retrievedCount;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (commentCount.hashCode) +
    (retrievedCount.hashCode);

  @override
  String toString() => 'GlobalCommentsDto[commentCount=$commentCount, retrievedCount=$retrievedCount]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'commentCount'] = this.commentCount;
      json[r'retrievedCount'] = this.retrievedCount;
    return json;
  }

  /// Returns a new [GlobalCommentsDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static GlobalCommentsDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'commentCount'), 'Required key "GlobalCommentsDto[commentCount]" is missing from JSON.');
        assert(json[r'commentCount'] != null, 'Required key "GlobalCommentsDto[commentCount]" has a null value in JSON.');
        assert(json.containsKey(r'retrievedCount'), 'Required key "GlobalCommentsDto[retrievedCount]" is missing from JSON.');
        assert(json[r'retrievedCount'] != null, 'Required key "GlobalCommentsDto[retrievedCount]" has a null value in JSON.');
        return true;
      }());

      return GlobalCommentsDto(
        commentCount: num.parse('${json[r'commentCount']}'),
        retrievedCount: num.parse('${json[r'retrievedCount']}'),
      );
    }
    return null;
  }

  static List<GlobalCommentsDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <GlobalCommentsDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = GlobalCommentsDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, GlobalCommentsDto> mapFromJson(dynamic json) {
    final map = <String, GlobalCommentsDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = GlobalCommentsDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of GlobalCommentsDto-objects as value to a dart map
  static Map<String, List<GlobalCommentsDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<GlobalCommentsDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = GlobalCommentsDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'commentCount',
    'retrievedCount',
  };
}

