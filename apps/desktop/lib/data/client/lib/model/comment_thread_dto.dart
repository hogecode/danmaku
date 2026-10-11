//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CommentThreadDto {
  /// Returns a new [CommentThreadDto] instance.
  CommentThreadDto({
    required this.id,
    this.comments = const [],
  });

  Object id;

  List<DPlayerCommentDto> comments;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CommentThreadDto &&
    other.id == id &&
    _deepEquality.equals(other.comments, comments);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (comments.hashCode);

  @override
  String toString() => 'CommentThreadDto[id=$id, comments=$comments]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'comments'] = this.comments;
    return json;
  }

  /// Returns a new [CommentThreadDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CommentThreadDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "CommentThreadDto[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "CommentThreadDto[id]" has a null value in JSON.');
        assert(json.containsKey(r'comments'), 'Required key "CommentThreadDto[comments]" is missing from JSON.');
        assert(json[r'comments'] != null, 'Required key "CommentThreadDto[comments]" has a null value in JSON.');
        return true;
      }());

      return CommentThreadDto(
        id: mapValueOfType<Object>(json, r'id')!,
        comments: DPlayerCommentDto.listFromJson(json[r'comments']),
      );
    }
    return null;
  }

  static List<CommentThreadDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CommentThreadDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CommentThreadDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CommentThreadDto> mapFromJson(dynamic json) {
    final map = <String, CommentThreadDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CommentThreadDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CommentThreadDto-objects as value to a dart map
  static Map<String, List<CommentThreadDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CommentThreadDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CommentThreadDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'comments',
  };
}

