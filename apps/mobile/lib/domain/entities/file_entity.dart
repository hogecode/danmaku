/// Google Drive ファイル/フォルダエンティティ
class FileEntity {
  final String id;
  final String name;
  final String mimeType;
  final bool isFolder;
  final DateTime createdTime;
  final DateTime modifiedTime;
  final int? size;

  const FileEntity({
    required this.id,
    required this.name,
    required this.mimeType,
    required this.isFolder,
    required this.createdTime,
    required this.modifiedTime,
    this.size,
  });

  /// このアイテムがビデオファイルかどうか
  bool get isVideo {
    return !isFolder &&
        (mimeType.contains('video') || name.endsWith('.mp4'));
  }

  /// コピー用メソッド
  FileEntity copyWith({
    String? id,
    String? name,
    String? mimeType,
    bool? isFolder,
    DateTime? createdTime,
    DateTime? modifiedTime,
    int? size,
  }) {
    return FileEntity(
      id: id ?? this.id,
      name: name ?? this.name,
      mimeType: mimeType ?? this.mimeType,
      isFolder: isFolder ?? this.isFolder,
      createdTime: createdTime ?? this.createdTime,
      modifiedTime: modifiedTime ?? this.modifiedTime,
      size: size ?? this.size,
    );
  }

  @override
  String toString() =>
      'FileEntity(id: $id, name: $name, isFolder: $isFolder, size: $size)';
}
