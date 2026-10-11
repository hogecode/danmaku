//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UserSettingsDto {
  /// Returns a new [UserSettingsDto] instance.
  UserSettingsDto({
    required this.id,
    required this.userId,
    required this.theme,
    required this.language,
    required this.danmakuMaxCount,
    this.ngWordsReg = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  String id;

  String userId;

  String theme;

  String language;

  num danmakuMaxCount;

  List<String> ngWordsReg;

  DateTime createdAt;

  DateTime updatedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UserSettingsDto &&
    other.id == id &&
    other.userId == userId &&
    other.theme == theme &&
    other.language == language &&
    other.danmakuMaxCount == danmakuMaxCount &&
    _deepEquality.equals(other.ngWordsReg, ngWordsReg) &&
    other.createdAt == createdAt &&
    other.updatedAt == updatedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (userId.hashCode) +
    (theme.hashCode) +
    (language.hashCode) +
    (danmakuMaxCount.hashCode) +
    (ngWordsReg.hashCode) +
    (createdAt.hashCode) +
    (updatedAt.hashCode);

  @override
  String toString() => 'UserSettingsDto[id=$id, userId=$userId, theme=$theme, language=$language, danmakuMaxCount=$danmakuMaxCount, ngWordsReg=$ngWordsReg, createdAt=$createdAt, updatedAt=$updatedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'user_id'] = this.userId;
      json[r'theme'] = this.theme;
      json[r'language'] = this.language;
      json[r'danmaku_max_count'] = this.danmakuMaxCount;
      json[r'ng_words_reg'] = this.ngWordsReg;
      json[r'created_at'] = this.createdAt.toUtc().toIso8601String();
      json[r'updated_at'] = this.updatedAt.toUtc().toIso8601String();
    return json;
  }

  /// Returns a new [UserSettingsDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UserSettingsDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "UserSettingsDto[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "UserSettingsDto[id]" has a null value in JSON.');
        assert(json.containsKey(r'user_id'), 'Required key "UserSettingsDto[user_id]" is missing from JSON.');
        assert(json[r'user_id'] != null, 'Required key "UserSettingsDto[user_id]" has a null value in JSON.');
        assert(json.containsKey(r'theme'), 'Required key "UserSettingsDto[theme]" is missing from JSON.');
        assert(json[r'theme'] != null, 'Required key "UserSettingsDto[theme]" has a null value in JSON.');
        assert(json.containsKey(r'language'), 'Required key "UserSettingsDto[language]" is missing from JSON.');
        assert(json[r'language'] != null, 'Required key "UserSettingsDto[language]" has a null value in JSON.');
        assert(json.containsKey(r'danmaku_max_count'), 'Required key "UserSettingsDto[danmaku_max_count]" is missing from JSON.');
        assert(json[r'danmaku_max_count'] != null, 'Required key "UserSettingsDto[danmaku_max_count]" has a null value in JSON.');
        assert(json.containsKey(r'ng_words_reg'), 'Required key "UserSettingsDto[ng_words_reg]" is missing from JSON.');
        assert(json[r'ng_words_reg'] != null, 'Required key "UserSettingsDto[ng_words_reg]" has a null value in JSON.');
        assert(json.containsKey(r'created_at'), 'Required key "UserSettingsDto[created_at]" is missing from JSON.');
        assert(json[r'created_at'] != null, 'Required key "UserSettingsDto[created_at]" has a null value in JSON.');
        assert(json.containsKey(r'updated_at'), 'Required key "UserSettingsDto[updated_at]" is missing from JSON.');
        assert(json[r'updated_at'] != null, 'Required key "UserSettingsDto[updated_at]" has a null value in JSON.');
        return true;
      }());

      return UserSettingsDto(
        id: mapValueOfType<String>(json, r'id')!,
        userId: mapValueOfType<String>(json, r'user_id')!,
        theme: mapValueOfType<String>(json, r'theme')!,
        language: mapValueOfType<String>(json, r'language')!,
        danmakuMaxCount: num.parse('${json[r'danmaku_max_count']}'),
        ngWordsReg: json[r'ng_words_reg'] is Iterable
            ? (json[r'ng_words_reg'] as Iterable).cast<String>().toList(growable: false)
            : const [],
        createdAt: mapDateTime(json, r'created_at', r'')!,
        updatedAt: mapDateTime(json, r'updated_at', r'')!,
      );
    }
    return null;
  }

  static List<UserSettingsDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserSettingsDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserSettingsDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UserSettingsDto> mapFromJson(dynamic json) {
    final map = <String, UserSettingsDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UserSettingsDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UserSettingsDto-objects as value to a dart map
  static Map<String, List<UserSettingsDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UserSettingsDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UserSettingsDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'user_id',
    'theme',
    'language',
    'danmaku_max_count',
    'ng_words_reg',
    'created_at',
    'updated_at',
  };
}

