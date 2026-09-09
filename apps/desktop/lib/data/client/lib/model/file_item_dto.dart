//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class FileItemDto {
  /// Returns a new [FileItemDto] instance.
  FileItemDto({
    required this.id,
    required this.name,
    required this.mimeType,
    this.size,
    required this.modifiedTime,
    required this.webViewLink,
    this.thumbnailLink,
    this.parentId,
  });

  /// ファイル/フォルダID
  String id;

  /// ファイル/フォルダ名
  String name;

  /// MIME タイプ - 'application/vnd.google-apps.folder' = フォルダ - 'video/mp4' = MP4 ビデオ
  String mimeType;

  /// ファイル/フォルダサイズ（バイト） フォルダの場合は null
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  num? size;

  /// 最終更新日時（ISO 8601形式）
  String modifiedTime;

  /// Google Drive WebView URL
  String webViewLink;

  /// サムネイル URL（ビデオファイルの場合のみ）
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? thumbnailLink;

  /// 親フォルダID
  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? parentId;

  @override
  bool operator ==(Object other) => identical(this, other) || other is FileItemDto &&
    other.id == id &&
    other.name == name &&
    other.mimeType == mimeType &&
    other.size == size &&
    other.modifiedTime == modifiedTime &&
    other.webViewLink == webViewLink &&
    other.thumbnailLink == thumbnailLink &&
    other.parentId == parentId;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (name.hashCode) +
    (mimeType.hashCode) +
    (size == null ? 0 : size!.hashCode) +
    (modifiedTime.hashCode) +
    (webViewLink.hashCode) +
    (thumbnailLink == null ? 0 : thumbnailLink!.hashCode) +
    (parentId == null ? 0 : parentId!.hashCode);

  @override
  String toString() => 'FileItemDto[id=$id, name=$name, mimeType=$mimeType, size=$size, modifiedTime=$modifiedTime, webViewLink=$webViewLink, thumbnailLink=$thumbnailLink, parentId=$parentId]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'name'] = this.name;
      json[r'mimeType'] = this.mimeType;
    if (this.size != null) {
      json[r'size'] = this.size;
    } else {
      json[r'size'] = null;
    }
      json[r'modifiedTime'] = this.modifiedTime;
      json[r'webViewLink'] = this.webViewLink;
    if (this.thumbnailLink != null) {
      json[r'thumbnailLink'] = this.thumbnailLink;
    } else {
      json[r'thumbnailLink'] = null;
    }
    if (this.parentId != null) {
      json[r'parentId'] = this.parentId;
    } else {
      json[r'parentId'] = null;
    }
    return json;
  }

  /// Returns a new [FileItemDto] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static FileItemDto? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "FileItemDto[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "FileItemDto[id]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "FileItemDto[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "FileItemDto[name]" has a null value in JSON.');
        assert(json.containsKey(r'mimeType'), 'Required key "FileItemDto[mimeType]" is missing from JSON.');
        assert(json[r'mimeType'] != null, 'Required key "FileItemDto[mimeType]" has a null value in JSON.');
        assert(json.containsKey(r'modifiedTime'), 'Required key "FileItemDto[modifiedTime]" is missing from JSON.');
        assert(json[r'modifiedTime'] != null, 'Required key "FileItemDto[modifiedTime]" has a null value in JSON.');
        assert(json.containsKey(r'webViewLink'), 'Required key "FileItemDto[webViewLink]" is missing from JSON.');
        assert(json[r'webViewLink'] != null, 'Required key "FileItemDto[webViewLink]" has a null value in JSON.');
        return true;
      }());

      return FileItemDto(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        mimeType: mapValueOfType<String>(json, r'mimeType')!,
        size: num.parse('${json[r'size']}'),
        modifiedTime: mapValueOfType<String>(json, r'modifiedTime')!,
        webViewLink: mapValueOfType<String>(json, r'webViewLink')!,
        thumbnailLink: mapValueOfType<String>(json, r'thumbnailLink'),
        parentId: mapValueOfType<String>(json, r'parentId'),
      );
    }
    return null;
  }

  static List<FileItemDto> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <FileItemDto>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = FileItemDto.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, FileItemDto> mapFromJson(dynamic json) {
    final map = <String, FileItemDto>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = FileItemDto.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of FileItemDto-objects as value to a dart map
  static Map<String, List<FileItemDto>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<FileItemDto>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = FileItemDto.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'name',
    'mimeType',
    'modifiedTime',
    'webViewLink',
  };
}

