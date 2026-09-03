import 'package:flutter/material.dart';

/// ファイル/フォルダ アイテムウィジェット
class FileItem extends StatelessWidget {
  final Map<String, dynamic> file;
  final bool isDarkMode;
  final VoidCallback onTap;

  const FileItem({
    Key? key,
    required this.file,
    required this.isDarkMode,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isFolder = file['isFolder'] as bool;
    final name = file['name'] as String;
    final type = file['type'] as String;

    return Container(
      margin: const EdgeInsets.symmetric(
          horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: isDarkMode
            ? const Color(0xFF2D2D2D)
            : Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          isFolder
              ? Icons.folder
              : (type == 'video'
                  ? Icons.videocam
                  : Icons.file_present),
          color: isFolder
              ? Colors.amber
              : Colors.blue,
        ),
        title: Text(name),
        subtitle: !isFolder
            ? Text(file['size'] ?? 'Unknown')
            : null,
        trailing:
            const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
