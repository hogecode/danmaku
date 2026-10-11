//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class KakologCommentDto {
  /// Returns a new [KakologCommentDto] instance.
  KakologCommentDto({
    required this.time,
    required this.type,
    required this.size,
    required this.color,
    required this.author,
    required this.text,
  });

  /// コメント表示時刻（秒単位）
  num time;

  /// コメント種類: \"normal\", \"top\", \"bottom\"
  KakologCommentDtoTypeEnum type;

  /// コメントサイズ: \"small\", \"medium\", \"big\"
  KakologCommentDtoSizeEnum size;

  /// コメント色（色番号、例: \"184\"）
  String color;

  /// 投稿者ID（匿名の場合は null）
  String? author;

  /// コメント内容
  String text;

  @override
  bool operator ==(Object other) => identical(this, other) || other is KakologCommentDto &&
    other.time == time &&
    other.type == type &&
    other.size == size &&
    other.color == color &&
    other.author == author &&
    other.text == text;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (time.hashCode) +
    (type.hashCode) +
    (size.hashCode) +
    (color.hashCode) +
    (author == null ? 0 : author!.hashCode) +
    (text.hashCode);

  @override
  String toString() => 'KakologCommentDto[time=$time, type=$type, size=$size, color=$color, author=$author, text=$text]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'time'] = this.time;
      json[r'type'] = this.type;
      json[r'size'] = this.size;
      json[r'color'] = this.color;
    if (this.author != null) {
      json[r'author'] = this.author;
    } else {
      json[r'author'] = null;
    }
      json[r'text'] = this.text;
    return json;
  }

  /// Returns a new [KakologCommentDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static KakologCommentDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'time'), 'Required key "KakologCommentDto[time]" is missing from JSON.');
        assert(json[r'time'] != null, 'Required key "KakologCommentDto[time]" has a null value in JSON.');
        assert(json.containsKey(r'type'), 'Required key "KakologCommentDto[type]" is missing from JSON.');
        assert(json[r'type'] != null, 'Required key "KakologCommentDto[type]" has a null value in JSON.');
        assert(json.containsKey(r'size'), 'Required key "KakologCommentDto[size]" is missing from JSON.');
        assert(json[r'size'] != null, 'Required key "KakologCommentDto[size]" has a null value in JSON.');
        assert(json.containsKey(r'color'), 'Required key "KakologCommentDto[color]" is missing from JSON.');
        assert(json[r'color'] != null, 'Required key "KakologCommentDto[color]" has a null value in JSON.');
        assert(json.containsKey(r'author'), 'Required key "KakologCommentDto[author]" is missing from JSON.');
        assert(json.containsKey(r'text'), 'Required key "KakologCommentDto[text]" is missing from JSON.');
        assert(json[r'text'] != null, 'Required key "KakologCommentDto[text]" has a null value in JSON.');
        return true;
      }());

      return KakologCommentDto(
        time: num.parse('${json[r'time']}'),
        type: KakologCommentDtoTypeEnum.fromJson(json[r'type'])!,
        size: KakologCommentDtoSizeEnum.fromJson(json[r'size'])!,
        color: mapValueOfType<String>(json, r'color')!,
        author: mapValueOfType<String>(json, r'author'),
        text: mapValueOfType<String>(json, r'text')!,
      );
    }
    return null;
  }

  static List<KakologCommentDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <KakologCommentDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = KakologCommentDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, KakologCommentDto> mapFromJson(dynamic json) {
    final map = <String, KakologCommentDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = KakologCommentDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of KakologCommentDto-objects as value to a dart map
  static Map<String, List<KakologCommentDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<KakologCommentDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = KakologCommentDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'time',
    'type',
    'size',
    'color',
    'author',
    'text',
  };
}

/// コメント種類: \"normal\", \"top\", \"bottom\"
class KakologCommentDtoTypeEnum {
  /// Instantiate a new enum with the provided [value].
  const KakologCommentDtoTypeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const normal = KakologCommentDtoTypeEnum._(r'normal');
  static const top = KakologCommentDtoTypeEnum._(r'top');
  static const bottom = KakologCommentDtoTypeEnum._(r'bottom');

  /// List of all possible values in this [enum][KakologCommentDtoTypeEnum].
  static const values = <KakologCommentDtoTypeEnum>[
    normal,
    top,
    bottom,
  ];

  static KakologCommentDtoTypeEnum? fromJson(dynamic value) => KakologCommentDtoTypeEnumTypeTransformer().decode(value);

  static List<KakologCommentDtoTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <KakologCommentDtoTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = KakologCommentDtoTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [KakologCommentDtoTypeEnum] to String,
/// and [decode] dynamic data back to [KakologCommentDtoTypeEnum].
class KakologCommentDtoTypeEnumTypeTransformer {
  factory KakologCommentDtoTypeEnumTypeTransformer() => _instance ??= const KakologCommentDtoTypeEnumTypeTransformer._();

  const KakologCommentDtoTypeEnumTypeTransformer._();

  String encode(KakologCommentDtoTypeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a KakologCommentDtoTypeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  KakologCommentDtoTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'normal': return KakologCommentDtoTypeEnum.normal;
        case r'top': return KakologCommentDtoTypeEnum.top;
        case r'bottom': return KakologCommentDtoTypeEnum.bottom;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [KakologCommentDtoTypeEnumTypeTransformer] instance.
  static KakologCommentDtoTypeEnumTypeTransformer? _instance;
}


/// コメントサイズ: \"small\", \"medium\", \"big\"
class KakologCommentDtoSizeEnum {
  /// Instantiate a new enum with the provided [value].
  const KakologCommentDtoSizeEnum._(this.value);

  /// The underlying value of this enum member.
  final String value;

  @override
  String toString() => value;

  String toJson() => value;

  static const big = KakologCommentDtoSizeEnum._(r'big');
  static const small = KakologCommentDtoSizeEnum._(r'small');
  static const medium = KakologCommentDtoSizeEnum._(r'medium');

  /// List of all possible values in this [enum][KakologCommentDtoSizeEnum].
  static const values = <KakologCommentDtoSizeEnum>[
    big,
    small,
    medium,
  ];

  static KakologCommentDtoSizeEnum? fromJson(dynamic value) => KakologCommentDtoSizeEnumTypeTransformer().decode(value);

  static List<KakologCommentDtoSizeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <KakologCommentDtoSizeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = KakologCommentDtoSizeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [KakologCommentDtoSizeEnum] to String,
/// and [decode] dynamic data back to [KakologCommentDtoSizeEnum].
class KakologCommentDtoSizeEnumTypeTransformer {
  factory KakologCommentDtoSizeEnumTypeTransformer() => _instance ??= const KakologCommentDtoSizeEnumTypeTransformer._();

  const KakologCommentDtoSizeEnumTypeTransformer._();

  String encode(KakologCommentDtoSizeEnum data) => data.value;

  /// Decodes a [dynamic value][data] to a KakologCommentDtoSizeEnum.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  KakologCommentDtoSizeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data != null) {
      switch (data) {
        case r'big': return KakologCommentDtoSizeEnum.big;
        case r'small': return KakologCommentDtoSizeEnum.small;
        case r'medium': return KakologCommentDtoSizeEnum.medium;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// Singleton [KakologCommentDtoSizeEnumTypeTransformer] instance.
  static KakologCommentDtoSizeEnumTypeTransformer? _instance;
}


