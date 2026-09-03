import 'package:mobile/domain/entities/file_entity.dart';

/// Google Drive ファイル/フォルダモデル（API レスポンス用）
class FileModel {
  final String id;
  final String name;
  final String mimeType;
  final bool isFolder;
  final DateTime createdTime;
  final DateTime modifiedTime;
  final int? size;

  FileModel({
    required this.id,
    required this.name,
    required this.mimeType,
    required this.isFolder,
    required this.createdTime,
    required this.modifiedTime,
    this.size,
  });

  /// JSON からインスタンスを作成
  factory FileModel.fromJson(
      Map<String, dynamic> json) {
    return FileModel(
      id: json['id'] as String,
      name: json['name'] as String,
      mimeType: json['mime_type'] as String,
      isFolder: json['is_folder'] as bool,
      createdTime: DateTime.parse(
          json['created_time'] as String),
      modifiedTime: DateTime.parse(
          json['modified_time'] as String),
      size: json['size'] as int?,
    );
  }

  /// JSON に変換
  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'mime_type': mimeType,
        'is_folder': isFolder,
        'created_time': createdTime.toIso8601String(),
        'modified_time':
            modifiedTime.toIso8601String(),
        'size': size,
      };

  /// エンティティに変換
  FileEntity toEntity() => FileEntity(
        id: id,
        name: name,
        mimeType: mimeType,
        isFolder: isFolder,
        createdTime: createdTime,
        modifiedTime: modifiedTime,
        size: size,
      );
}
