//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class DPlayerCommentDto {
  /// Returns a new [DPlayerCommentDto] instance.
  DPlayerCommentDto({
    required this.time,
    required this.type,
    required this.size,
    required this.color,
    this.author,
    required this.text,
  });

  /// コメント表示時刻（秒単位の浮動小数点数） 例: 10.5 (10秒500ミリ秒)
  num time;

  /// コメント種類 - \"normal\" (中央) - \"top\" / \"ue\" (上) - \"bottom\" / \"shita\" (下)
  String type;

  /// コメント文字サイズ - \"small\" (小) - \"normal\" / \"\" (通常) - \"big\" (大)
  String size;

  /// コメント色（16進数カラーコード） 例: \"#ffffff\" (白)
  String color;

  /// コメント投稿者ID（匿名の場合は null）
  String? author;

  /// コメント内容（テキスト）
  String text;

  @override
  bool operator ==(Object other) => identical(this, other) || other is DPlayerCommentDto &&
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
  String toString() => 'DPlayerCommentDto[time=$time, type=$type, size=$size, color=$color, author=$author, text=$text]';

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

  /// Returns a new [DPlayerCommentDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static DPlayerCommentDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'time'), 'Required key "DPlayerCommentDto[time]" is missing from JSON.');
        assert(json[r'time'] != null, 'Required key "DPlayerCommentDto[time]" has a null value in JSON.');
        assert(json.containsKey(r'type'), 'Required key "DPlayerCommentDto[type]" is missing from JSON.');
        assert(json[r'type'] != null, 'Required key "DPlayerCommentDto[type]" has a null value in JSON.');
        assert(json.containsKey(r'size'), 'Required key "DPlayerCommentDto[size]" is missing from JSON.');
        assert(json[r'size'] != null, 'Required key "DPlayerCommentDto[size]" has a null value in JSON.');
        assert(json.containsKey(r'color'), 'Required key "DPlayerCommentDto[color]" is missing from JSON.');
        assert(json[r'color'] != null, 'Required key "DPlayerCommentDto[color]" has a null value in JSON.');
        assert(json.containsKey(r'text'), 'Required key "DPlayerCommentDto[text]" is missing from JSON.');
        assert(json[r'text'] != null, 'Required key "DPlayerCommentDto[text]" has a null value in JSON.');
        return true;
      }());

      return DPlayerCommentDto(
        time: num.parse('${json[r'time']}'),
        type: mapValueOfType<String>(json, r'type')!,
        size: mapValueOfType<String>(json, r'size')!,
        color: mapValueOfType<String>(json, r'color')!,
        author: mapValueOfType<String>(json, r'author'),
        text: mapValueOfType<String>(json, r'text')!,
      );
    }
    return null;
  }

  static List<DPlayerCommentDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <DPlayerCommentDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = DPlayerCommentDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, DPlayerCommentDto> mapFromJson(dynamic json) {
    final map = <String, DPlayerCommentDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = DPlayerCommentDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of DPlayerCommentDto-objects as value to a dart map
  static Map<String, List<DPlayerCommentDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<DPlayerCommentDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = DPlayerCommentDto.listFromJson(entry.value, growable: growable,);
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
    'text',
  };
}

