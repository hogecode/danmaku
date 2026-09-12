//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class UserInfoDto {
  /// Returns a new [UserInfoDto] instance.
  UserInfoDto({
    required this.id,
    required this.email,
    this.name,
    this.pictureUrl,
    this.lastLogin,
    this.drives = const [],
  });

  String id;

  String email;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? name;

  String? pictureUrl;

  DateTime? lastLogin;

  List<DriveConnectionDto> drives;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UserInfoDto &&
    other.id == id &&
    other.email == email &&
    other.name == name &&
    other.pictureUrl == pictureUrl &&
    other.lastLogin == lastLogin &&
    _deepEquality.equals(other.drives, drives);

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (email.hashCode) +
    (name == null ? 0 : name!.hashCode) +
    (pictureUrl == null ? 0 : pictureUrl!.hashCode) +
    (lastLogin == null ? 0 : lastLogin!.hashCode) +
    (drives.hashCode);

  @override
  String toString() => 'UserInfoDto[id=$id, email=$email, name=$name, pictureUrl=$pictureUrl, lastLogin=$lastLogin, drives=$drives]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'email'] = this.email;
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.pictureUrl != null) {
      json[r'picture_url'] = this.pictureUrl;
    } else {
      json[r'picture_url'] = null;
    }
    if (this.lastLogin != null) {
      json[r'last_login'] = this.lastLogin!.toUtc().toIso8601String();
    } else {
      json[r'last_login'] = null;
    }
      json[r'drives'] = this.drives;
    return json;
  }

  /// Returns a new [UserInfoDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UserInfoDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "UserInfoDto[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "UserInfoDto[id]" has a null value in JSON.');
        assert(json.containsKey(r'email'), 'Required key "UserInfoDto[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "UserInfoDto[email]" has a null value in JSON.');
        assert(json.containsKey(r'drives'), 'Required key "UserInfoDto[drives]" is missing from JSON.');
        assert(json[r'drives'] != null, 'Required key "UserInfoDto[drives]" has a null value in JSON.');
        return true;
      }());

      return UserInfoDto(
        id: mapValueOfType<String>(json, r'id')!,
        email: mapValueOfType<String>(json, r'email')!,
        name: mapValueOfType<String>(json, r'name'),
        pictureUrl: mapValueOfType<String>(json, r'picture_url'),
        lastLogin: mapDateTime(json, r'last_login', r''),
        drives: DriveConnectionDto.listFromJson(json[r'drives']),
      );
    }
    return null;
  }

  static List<UserInfoDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserInfoDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserInfoDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UserInfoDto> mapFromJson(dynamic json) {
    final map = <String, UserInfoDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UserInfoDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UserInfoDto-objects as value to a dart map
  static Map<String, List<UserInfoDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UserInfoDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UserInfoDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'email',
    'drives',
  };
}

