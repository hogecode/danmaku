//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class LoginResponseDto {
  /// Returns a new [LoginResponseDto] instance.
  LoginResponseDto({
    required this.authorizeUrl,
    required this.state,
    required this.expiresIn,
  });

  String authorizeUrl;

  String state;

  num expiresIn;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LoginResponseDto &&
    other.authorizeUrl == authorizeUrl &&
    other.state == state &&
    other.expiresIn == expiresIn;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (authorizeUrl.hashCode) +
    (state.hashCode) +
    (expiresIn.hashCode);

  @override
  String toString() => 'LoginResponseDto[authorizeUrl=$authorizeUrl, state=$state, expiresIn=$expiresIn]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'authorize_url'] = this.authorizeUrl;
      json[r'state'] = this.state;
      json[r'expires_in'] = this.expiresIn;
    return json;
  }

  /// Returns a new [LoginResponseDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LoginResponseDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'authorize_url'), 'Required key "LoginResponseDto[authorize_url]" is missing from JSON.');
        assert(json[r'authorize_url'] != null, 'Required key "LoginResponseDto[authorize_url]" has a null value in JSON.');
        assert(json.containsKey(r'state'), 'Required key "LoginResponseDto[state]" is missing from JSON.');
        assert(json[r'state'] != null, 'Required key "LoginResponseDto[state]" has a null value in JSON.');
        assert(json.containsKey(r'expires_in'), 'Required key "LoginResponseDto[expires_in]" is missing from JSON.');
        assert(json[r'expires_in'] != null, 'Required key "LoginResponseDto[expires_in]" has a null value in JSON.');
        return true;
      }());

      return LoginResponseDto(
        authorizeUrl: mapValueOfType<String>(json, r'authorize_url')!,
        state: mapValueOfType<String>(json, r'state')!,
        expiresIn: num.parse('${json[r'expires_in']}'),
      );
    }
    return null;
  }

  static List<LoginResponseDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LoginResponseDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LoginResponseDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LoginResponseDto> mapFromJson(dynamic json) {
    final map = <String, LoginResponseDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LoginResponseDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LoginResponseDto-objects as value to a dart map
  static Map<String, List<LoginResponseDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LoginResponseDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LoginResponseDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'authorize_url',
    'state',
    'expires_in',
  };
}

