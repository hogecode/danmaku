//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DriveConnectionDto {
  /// Returns a new [DriveConnectionDto] instance.
  DriveConnectionDto({
    required this.id,
    required this.provider,
    required this.account,
    required this.status,
    required this.connectedAt,
  });

  String id;

  String provider;

  String account;

  DriveConnectionDtoStatusEnum status;

  DateTime connectedAt;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DriveConnectionDto &&
    other.id == id &&
    other.provider == provider &&
    other.account == account &&
    other.status == status &&
    other.connectedAt == connectedAt;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (provider.hashCode) +
    (account.hashCode) +
    (status.hashCode) +
    (connectedAt.hashCode);

  @override
  String toString() => 'DriveConnectionDto[id=$id, provider=$provider, account=$account, status=$status, connectedAt=$connectedAt]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'provider'] = this.provider;
      json[r'account'] = this.account;
      json[r'status'] = this.status;
      json[r'connected_at'] = this.connectedAt.toUtc().toIso8601String();
    return json;
  }

  /// Returns a new [DriveConnectionDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DriveConnectionDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "DriveConnectionDto[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "DriveConnectionDto[id]" has a null value in JSON.');
        assert(json.containsKey(r'provider'), 'Required key "DriveConnectionDto[provider]" is missing from JSON.');
        assert(json[r'provider'] != null, 'Required key "DriveConnectionDto[provider]" has a null value in JSON.');
        assert(json.containsKey(r'account'), 'Required key "DriveConnectionDto[account]" is missing from JSON.');
        assert(json[r'account'] != null, 'Required key "DriveConnectionDto[account]" has a null value in JSON.');
        assert(json.containsKey(r'status'), 'Required key "DriveConnectionDto[status]" is missing from JSON.');
        assert(json[r'status'] != null, 'Required key "DriveConnectionDto[status]" has a null value in JSON.');
        assert(json.containsKey(r'connected_at'), 'Required key "DriveConnectionDto[connected_at]" is missing from JSON.');
        assert(json[r'connected_at'] != null, 'Required key "DriveConnectionDto[connected_at]" has a null value in JSON.');
        return true;
      }());

      return DriveConnectionDto(
        id: mapValueOfType<String>(json, r'id')!,
        provider: mapValueOfType<String>(json, r'provider')!,
        account: mapValueOfType<String>(json, r'account')!,
        status: DriveConnectionDtoStatusEnum.fromJson(json[r'status'])!,
        connectedAt: mapDateTime(json, r'connected_at', r'')!,
      );
    }
    return null;
  }

  static List<DriveConnectionDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DriveConnectionDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DriveConnectionDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DriveConnectionDto> mapFromJson(dynamic json) {
    final map = <String, DriveConnectionDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DriveConnectionDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DriveConnectionDto-objects as value to a dart map
  static Map<String, List<DriveConnectionDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DriveConnectionDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DriveConnectionDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'provider',
    'account',
    'status',
    'connected_at',
  };
}


class DriveConnectionDtoStatusEnum {
  /// Instantiate a new enum with the provided [value].
  const DriveConnectionDtoStatusEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const connected = DriveConnectionDtoStatusEnum._(r'connected');
  static const expired = DriveConnectionDtoStatusEnum._(r'expired');
  static const revoked = DriveConnectionDtoStatusEnum._(r'revoked');
  static const error = DriveConnectionDtoStatusEnum._(r'error');

  /// List of all possible values in this [enum][DriveConnectionDtoStatusEnum].
  static const values = <DriveConnectionDtoStatusEnum>[
    connected,
    expired,
    revoked,
    error,
  ];

  static DriveConnectionDtoStatusEnum? fromJson(dynamic value) => DriveConnectionDtoStatusEnumTypeTransformer().decode(value);

  static List<DriveConnectionDtoStatusEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DriveConnectionDtoStatusEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DriveConnectionDtoStatusEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [DriveConnectionDtoStatusEnum] to String,
/// and [decode] dynamic data back to [DriveConnectionDtoStatusEnum].
class DriveConnectionDtoStatusEnumTypeTransformer {
  factory DriveConnectionDtoStatusEnumTypeTransformer() => _instance ??= const DriveConnectionDtoStatusEnumTypeTransformer._();

  const DriveConnectionDtoStatusEnumTypeTransformer._();

  String encode(DriveConnectionDtoStatusEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a DriveConnectionDtoStatusEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  DriveConnectionDtoStatusEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'connected': return DriveConnectionDtoStatusEnum.connected;
        case r'expired': return DriveConnectionDtoStatusEnum.expired;
        case r'revoked': return DriveConnectionDtoStatusEnum.revoked;
        case r'error': return DriveConnectionDtoStatusEnum.error;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [DriveConnectionDtoStatusEnumTypeTransformer] instance.
  static DriveConnectionDtoStatusEnumTypeTransformer? _instance;
}


