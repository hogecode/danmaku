//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CommentDataDto {
  /// Returns a new [CommentDataDto] instance.
  CommentDataDto({
    required this.title,
    required this.commentCount,
    required this.retrievedCount,
    required this.threads,
  });

  String title;

  num commentCount;

  num retrievedCount;

  num threads;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CommentDataDto &&
    other.title == title &&
    other.commentCount == commentCount &&
    other.retrievedCount == retrievedCount &&
    other.threads == threads;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (title.hashCode) +
    (commentCount.hashCode) +
    (retrievedCount.hashCode) +
    (threads.hashCode);

  @override
  String toString() => 'CommentDataDto[title=$title, commentCount=$commentCount, retrievedCount=$retrievedCount, threads=$threads]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'title'] = this.title;
      json[r'commentCount'] = this.commentCount;
      json[r'retrievedCount'] = this.retrievedCount;
      json[r'threads'] = this.threads;
    return json;
  }

  /// Returns a new [CommentDataDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CommentDataDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'title'), 'Required key "CommentDataDto[title]" is missing from JSON.');
        assert(json[r'title'] != null, 'Required key "CommentDataDto[title]" has a null value in JSON.');
        assert(json.containsKey(r'commentCount'), 'Required key "CommentDataDto[commentCount]" is missing from JSON.');
        assert(json[r'commentCount'] != null, 'Required key "CommentDataDto[commentCount]" has a null value in JSON.');
        assert(json.containsKey(r'retrievedCount'), 'Required key "CommentDataDto[retrievedCount]" is missing from JSON.');
        assert(json[r'retrievedCount'] != null, 'Required key "CommentDataDto[retrievedCount]" has a null value in JSON.');
        assert(json.containsKey(r'threads'), 'Required key "CommentDataDto[threads]" is missing from JSON.');
        assert(json[r'threads'] != null, 'Required key "CommentDataDto[threads]" has a null value in JSON.');
        return true;
      }());

      return CommentDataDto(
        title: mapValueOfType<String>(json, r'title')!,
        commentCount: num.parse('${json[r'commentCount']}'),
        retrievedCount: num.parse('${json[r'retrievedCount']}'),
        threads: num.parse('${json[r'threads']}'),
      );
    }
    return null;
  }

  static List<CommentDataDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CommentDataDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CommentDataDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CommentDataDto> mapFromJson(dynamic json) {
    final map = <String, CommentDataDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CommentDataDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CommentDataDto-objects as value to a dart map
  static Map<String, List<CommentDataDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CommentDataDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CommentDataDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'title',
    'commentCount',
    'retrievedCount',
    'threads',
  };
}

