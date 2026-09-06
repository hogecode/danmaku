import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/ui_provider.dart';

final _logger = Logger();

class DrivePage extends ConsumerStatefulWidget {
  const DrivePage({Key? key}) : super(key: key);

  @override
  ConsumerState<DrivePage> createState() => _DrivePageState();
}

class _DrivePageState extends ConsumerState<DrivePage> {
  late List<DriveFile> _files = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _logger.i('Google Drive ページを初期化');
    _loadDriveFiles();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = ref.watch(darkModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Google Drive'),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : _files.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.cloud_off, size: 80, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text(
                        'ファイルがありません',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _files.length,
                  itemBuilder: (context, index) {
                    final file = _files[index];
                    return ListTile(
                      leading: Icon(
                        file.isVideo ? Icons.videocam : Icons.folder,
                        color: Colors.blue,
                      ),
                      title: Text(file.name),
                      subtitle: Text(file.modifiedTime ?? 'Unknown'),
                      trailing: file.isVideo
                          ? IconButton(
                              icon: const Icon(Icons.play_arrow),
                              onPressed: () {
                                context.go(
                                  '/watch/${file.id}?fileName=${file.name}',
                                );
                              },
                            )
                          : null,
                      onTap: () {
                        if (file.isVideo) {
                          context.go(
                            '/watch/${file.id}?fileName=${file.name}',
                          );
                        }
                      },
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _refreshFiles,
        tooltip: '更新',
        child: const Icon(Icons.refresh),
      ),
    );
  }

  /// Google Drive のファイルを読み込む
  Future<void> _loadDriveFiles() async {
    try {
      _logger.i('Google Drive のファイルを読み込み中...');
      setState(() => _isLoading = true);

      // TODO: API でファイル一覧を取得
      await Future.delayed(const Duration(seconds: 1));

      setState(() {
        _files = [
          DriveFile(
            id: '1',
            name: 'サンプル動画 1.mp4',
            modifiedTime: '2026-09-06',
            isVideo: true,
          ),
          DriveFile(
            id: '2',
            name: 'サンプル動画 2.mp4',
            modifiedTime: '2026-09-05',
            isVideo: true,
          ),
          DriveFile(
            id: '3',
            name: 'フォルダ',
            modifiedTime: '2026-09-04',
            isVideo: false,
          ),
        ];
        _isLoading = false;
      });

      _logger.i('Google Drive のファイル読み込み完了: ${_files.length} 個');
    } catch (e) {
      _logger.e('Google Drive のファイル読み込み失敗', error: e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('読み込み失敗: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() => _isLoading = false);
    }
  }

  /// ファイルを更新
  Future<void> _refreshFiles() async {
    await _loadDriveFiles();
  }
}

/// Google Drive ファイルモデル
class DriveFile {
  final String id;
  final String name;
  final String? modifiedTime;
  final bool isVideo;

  DriveFile({
    required this.id,
    required this.name,
    this.modifiedTime,
    required this.isVideo,
  });
}
