import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/presentation/providers/ui_provider.dart';
import 'package:mobile/presentation/providers/router_provider.dart';
import 'package:mobile/presentation/providers/navigation_provider.dart';

class DrivePage
    extends ConsumerStatefulWidget {
  const DrivePage({Key? key})
      : super(key: key);

  @override
  ConsumerState<DrivePage>
      createState() =>
          _DrivePageState();
}

class _DrivePageState
    extends ConsumerState<DrivePage> {
  late TextEditingController _sc;

  @override
  void initState() {
    super.initState();
    _sc = TextEditingController();
  }

  @override
  void dispose() {
    _sc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode =
        ref.watch(darkModeProvider);
    final folderName = ref.watch(
        currentFolderNameProvider);

    return Scaffold(
      backgroundColor: isDarkMode
          ? const Color(0xFF1A1A1A)
          : const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Google Drive'),
        leading: IconButton(
          icon:
              const Icon(Icons
                  .arrow_back),
          onPressed: () =>
              context.pop(),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                TextButton(
                  onPressed: () {
                    ref.read(currentFolderIdProvider.notifier).state =
                        'root';
                    ref.read(currentFolderNameProvider.notifier).state =
                        'My Drive';
                  },
                  child: const Text('My Drive',
                      style: TextStyle(color: Colors.blue)),
                ),
                if (folderName != 'My Drive') ...[
                  const Text('/'),
                  Text(folderName),
                ],
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _sc,
              decoration: InputDecoration(
                hintText: 'ファイルを検索',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
          Expanded(
            child: ListView(
              children: [
                _buildItem(
                    'Big Buck Bunny',
                    'video',
                    '256 MB',
                    false,
                    isDarkMode, () {
                  context.go(
                    '${Routes.player.replaceFirst(':videoId', 'test1')}?fileName=Big%20Buck%20Bunny',
                  );
                }),
                _buildItem(
                    'My Folder', 'folder', '', true, isDarkMode, () {
                  ref.read(currentFolderIdProvider.notifier).state =
                      'folder1';
                  ref.read(currentFolderNameProvider.notifier).state =
                      'My Folder';
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItem(String name, String type, String size, bool isFolder,
      bool isDarkMode, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF2D2D2D) : Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          isFolder ? Icons.folder : Icons.videocam,
          color: isFolder ? Colors.amber : Colors.blue,
        ),
        title: Text(name),
        subtitle: !isFolder ? Text(size) : null,
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

