//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UpdateUserSettingsDto {
  /// Returns a new [UpdateUserSettingsDto] instance.
  UpdateUserSettingsDto({
    this.theme,
    this.language,
    this.danmakuMaxCount,
    this.ngWordsReg = const [],
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? theme;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? language;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? danmakuMaxCount;

  List<String> ngWordsReg;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateUserSettingsDto &&
    other.theme == theme &&
    other.language == language &&
    other.danmakuMaxCount == danmakuMaxCount &&
    _deepEquality.equals(other.ngWordsReg, ngWordsReg);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (theme == null ? 0 : theme!.hashCode) +
    (language == null ? 0 : language!.hashCode) +
    (danmakuMaxCount == null ? 0 : danmakuMaxCount!.hashCode) +
    (ngWordsReg.hashCode);

  @override
  String toString() => 'UpdateUserSettingsDto[theme=$theme, language=$language, danmakuMaxCount=$danmakuMaxCount, ngWordsReg=$ngWordsReg]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.theme != null) {
      json[r'theme'] = this.theme;
    } else {
      json[r'theme'] = null;
    }
    if (this.language != null) {
      json[r'language'] = this.language;
    } else {
      json[r'language'] = null;
    }
    if (this.danmakuMaxCount != null) {
      json[r'danmaku_max_count'] = this.danmakuMaxCount;
    } else {
      json[r'danmaku_max_count'] = null;
    }
      json[r'ng_words_reg'] = this.ngWordsReg;
    return json;
  }

  /// Returns a new [UpdateUserSettingsDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateUserSettingsDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateUserSettingsDto(
        theme: mapValueOfType<String>(json, r'theme'),
        language: mapValueOfType<String>(json, r'language'),
        danmakuMaxCount: num.parse('${json[r'danmaku_max_count']}'),
        ngWordsReg: json[r'ng_words_reg'] is Iterable
            ? (json[r'ng_words_reg'] as Iterable).cast<String>().toList(growable: false)
            : const [],
      );
    }
    return null;
  }

  static List<UpdateUserSettingsDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateUserSettingsDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateUserSettingsDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateUserSettingsDto> mapFromJson(dynamic json) {
    final map = <String, UpdateUserSettingsDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateUserSettingsDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateUserSettingsDto-objects as value to a dart map
  static Map<String, List<UpdateUserSettingsDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateUserSettingsDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateUserSettingsDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}

