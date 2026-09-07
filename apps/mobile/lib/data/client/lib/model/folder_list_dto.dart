//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class FolderListDto {
  /// Returns a new [FolderListDto] instance.
  FolderListDto({
    this.items = const [],
    this.nextPageToken,
  });

  /// フォルダ内のファイル/フォルダ一覧
  List<FileItemDto> items;

  /// 次のページトークン（ページネーション用） あれば指定してリクエスト
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? nextPageToken;

  @override
  bool operator ==(Object other) => identical(this, other) || other is FolderListDto &&
    _deepEquality.equals(other.items, items) &&
    other.nextPageToken == nextPageToken;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (items.hashCode) +
    (nextPageToken == null ? 0 : nextPageToken!.hashCode);

  @override
  String toString() => 'FolderListDto[items=$items, nextPageToken=$nextPageToken]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'items'] = this.items;
    if (this.nextPageToken != null) {
      json[r'nextPageToken'] = this.nextPageToken;
    } else {
      json[r'nextPageToken'] = null;
    }
    return json;
  }

  /// Returns a new [FolderListDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static FolderListDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'items'), 'Required key "FolderListDto[items]" is missing from JSON.');
        assert(json[r'items'] != null, 'Required key "FolderListDto[items]" has a null value in JSON.');
        return true;
      }());

      return FolderListDto(
        items: FileItemDto.listFromJson(json[r'items']),
        nextPageToken: mapValueOfType<String>(json, r'nextPageToken'),
      );
    }
    return null;
  }

  static List<FolderListDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <FolderListDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = FolderListDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, FolderListDto> mapFromJson(dynamic json) {
    final map = <String, FolderListDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = FolderListDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of FolderListDto-objects as value to a dart map
  static Map<String, List<FolderListDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<FolderListDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = FolderListDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'items',
  };
}

