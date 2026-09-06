import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/ui_provider.dart';
import 'package:mobile/services/drive_service.dart';

final _logger = Logger();

class DrivePage extends ConsumerStatefulWidget {
  const DrivePage({Key? key}) : super(key: key);

  @override
  ConsumerState<DrivePage> createState() => _DrivePageState();
}

class _DrivePageState extends ConsumerState<DrivePage> {
  late final DriveService _driveService = DriveService();
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
      // TODO: Widget分ける
      appBar: AppBar(
        title: const Text('Google Drive'),
        elevation: 0,
        // TODO: 前に戻るようにする
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
                      // TODO: フォルダの場合も設定する
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

      // DriveService でファイル一覧を取得
      final files = await _driveService.listFolder();

      setState(() {
        _files = files;
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
