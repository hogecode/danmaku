//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DownloadVideoRequestDto {
  /// Returns a new [DownloadVideoRequestDto] instance.
  DownloadVideoRequestDto({
    required this.videoId,
    this.quality,
    this.commentsLimit,
    this.commentsFrom,
    this.downloadComments,
  });

  String videoId;

  DownloadVideoRequestDtoQualityEnum? quality;

  /// Minimum value: 1
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? commentsLimit;

  /// Minimum value: 0
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? commentsFrom;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  bool? downloadComments;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DownloadVideoRequestDto &&
    other.videoId == videoId &&
    other.quality == quality &&
    other.commentsLimit == commentsLimit &&
    other.commentsFrom == commentsFrom &&
    other.downloadComments == downloadComments;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (videoId.hashCode) +
    (quality == null ? 0 : quality!.hashCode) +
    (commentsLimit == null ? 0 : commentsLimit!.hashCode) +
    (commentsFrom == null ? 0 : commentsFrom!.hashCode) +
    (downloadComments == null ? 0 : downloadComments!.hashCode);

  @override
  String toString() => 'DownloadVideoRequestDto[videoId=$videoId, quality=$quality, commentsLimit=$commentsLimit, commentsFrom=$commentsFrom, downloadComments=$downloadComments]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'videoId'] = this.videoId;
    if (this.quality != null) {
      json[r'quality'] = this.quality;
    } else {
      json[r'quality'] = null;
    }
    if (this.commentsLimit != null) {
      json[r'commentsLimit'] = this.commentsLimit;
    } else {
      json[r'commentsLimit'] = null;
    }
    if (this.commentsFrom != null) {
      json[r'commentsFrom'] = this.commentsFrom;
    } else {
      json[r'commentsFrom'] = null;
    }
    if (this.downloadComments != null) {
      json[r'downloadComments'] = this.downloadComments;
    } else {
      json[r'downloadComments'] = null;
    }
    return json;
  }

  /// Returns a new [DownloadVideoRequestDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DownloadVideoRequestDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'videoId'), 'Required key "DownloadVideoRequestDto[videoId]" is missing from JSON.');
        assert(json[r'videoId'] != null, 'Required key "DownloadVideoRequestDto[videoId]" has a null value in JSON.');
        return true;
      }());

      return DownloadVideoRequestDto(
        videoId: mapValueOfType<String>(json, r'videoId')!,
        quality: DownloadVideoRequestDtoQualityEnum.fromJson(json[r'quality']),
        commentsLimit: num.parse('${json[r'commentsLimit']}'),
        commentsFrom: num.parse('${json[r'commentsFrom']}'),
        downloadComments: mapValueOfType<bool>(json, r'downloadComments'),
      );
    }
    return null;
  }

  static List<DownloadVideoRequestDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DownloadVideoRequestDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DownloadVideoRequestDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DownloadVideoRequestDto> mapFromJson(dynamic json) {
    final map = <String, DownloadVideoRequestDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DownloadVideoRequestDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DownloadVideoRequestDto-objects as value to a dart map
  static Map<String, List<DownloadVideoRequestDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DownloadVideoRequestDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DownloadVideoRequestDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'videoId',
  };
}


class DownloadVideoRequestDtoQualityEnum {
  /// Instantiate a new enum with the provided [value].
  const DownloadVideoRequestDtoQualityEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const high = DownloadVideoRequestDtoQualityEnum._(r'high');
  static const low = DownloadVideoRequestDtoQualityEnum._(r'low');
  static const auto = DownloadVideoRequestDtoQualityEnum._(r'auto');

  /// List of all possible values in this [enum][DownloadVideoRequestDtoQualityEnum].
  static const values = <DownloadVideoRequestDtoQualityEnum>[
    high,
    low,
    auto,
  ];

  static DownloadVideoRequestDtoQualityEnum? fromJson(dynamic value) => DownloadVideoRequestDtoQualityEnumTypeTransformer().decode(value);

  static List<DownloadVideoRequestDtoQualityEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DownloadVideoRequestDtoQualityEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DownloadVideoRequestDtoQualityEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [DownloadVideoRequestDtoQualityEnum] to String,
/// and [decode] dynamic data back to [DownloadVideoRequestDtoQualityEnum].
class DownloadVideoRequestDtoQualityEnumTypeTransformer {
  factory DownloadVideoRequestDtoQualityEnumTypeTransformer() => _instance ??= const DownloadVideoRequestDtoQualityEnumTypeTransformer._();

  const DownloadVideoRequestDtoQualityEnumTypeTransformer._();

  String encode(DownloadVideoRequestDtoQualityEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a DownloadVideoRequestDtoQualityEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  DownloadVideoRequestDtoQualityEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'high': return DownloadVideoRequestDtoQualityEnum.high;
        case r'low': return DownloadVideoRequestDtoQualityEnum.low;
        case r'auto': return DownloadVideoRequestDtoQualityEnum.auto;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [DownloadVideoRequestDtoQualityEnumTypeTransformer] instance.
  static DownloadVideoRequestDtoQualityEnumTypeTransformer? _instance;
}


