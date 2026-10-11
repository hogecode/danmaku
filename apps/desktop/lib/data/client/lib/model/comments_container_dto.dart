//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class CommentsContainerDto {
  /// Returns a new [CommentsContainerDto] instance.
  CommentsContainerDto({
    required this.globalComments,
    this.threads = const [],
  });

  GlobalCommentsDto globalComments;

  List<CommentThreadDto> threads;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CommentsContainerDto &&
    other.globalComments == globalComments &&
    _deepEquality.equals(other.threads, threads);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (globalComments.hashCode) +
    (threads.hashCode);

  @override
  String toString() => 'CommentsContainerDto[globalComments=$globalComments, threads=$threads]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'globalComments'] = this.globalComments;
      json[r'threads'] = this.threads;
    return json;
  }

  /// Returns a new [CommentsContainerDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CommentsContainerDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'globalComments'), 'Required key "CommentsContainerDto[globalComments]" is missing from JSON.');
        assert(json[r'globalComments'] != null, 'Required key "CommentsContainerDto[globalComments]" has a null value in JSON.');
        assert(json.containsKey(r'threads'), 'Required key "CommentsContainerDto[threads]" is missing from JSON.');
        assert(json[r'threads'] != null, 'Required key "CommentsContainerDto[threads]" has a null value in JSON.');
        return true;
      }());

      return CommentsContainerDto(
        globalComments: GlobalCommentsDto.fromJson(json[r'globalComments'])!,
        threads: CommentThreadDto.listFromJson(json[r'threads']),
      );
    }
    return null;
  }

  static List<CommentsContainerDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CommentsContainerDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CommentsContainerDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CommentsContainerDto> mapFromJson(dynamic json) {
    final map = <String, CommentsContainerDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CommentsContainerDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CommentsContainerDto-objects as value to a dart map
  static Map<String, List<CommentsContainerDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CommentsContainerDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CommentsContainerDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'globalComments',
    'threads',
  };
}

