import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:desktop/core/logger/app_logger.dart';
import 'package:desktop/data/client/lib/api.dart';
import 'package:desktop/providers/auth_provider.dart';
import 'package:desktop/services/drive_service.dart';

class DrivePage extends ConsumerStatefulWidget {
  const DrivePage({super.key});
  @override
  ConsumerState<DrivePage> createState() => _DrivePageState();
}


class _DrivePageState extends ConsumerState<DrivePage> {
  /// Google Drive サービス
  late final DriveService _driveService = DriveService();
  /// Google Drive のファイル一覧
  late List<FileItemDto> _files = [];
  /// ファイルの読み込み中かどうか
  bool _isLoading = true;
  // フォルダのスタック（現在のフォルダIDを管理するためのリスト）
  final List<String> _folderStack = ['root'];
  /// 現在のフォルダIDを取得
  String get _currentFolderId => _folderStack.last;
  /// フォルダのMIMEタイプ
  static const String _folderMimeType = 'application/vnd.google-apps.folder';

  @override
  void initState() {
    super.initState();
    appLogger.info('Google Drive ページを初期化');
    Future.microtask(() {
      final authState = ref.read(authProvider);
      if (!authState.isAuthenticated) {
        appLogger.warning('Google Drive ページ: ユーザーがログインしていません');
        if (mounted) {
          context.go('/login');
        }
      } else {
        _loadDriveFiles(_currentFolderId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    if (!authState.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Google Drive'), elevation: 0),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(_getDisplayTitle()),
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: _onBackPressed),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _files.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.cloud_off, size: 80, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text('ファイルがありません', style: Theme.of(context).textTheme.bodyLarge),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _files.length,
                  itemBuilder: (context, index) {
                    final file = _files[index];
                    final isVideo = _isVideo(file);
                    final isFolder = _isFolder(file);
                    return ListTile(
                      leading: Icon(isVideo ? Icons.videocam : Icons.folder, color: Colors.blue),
                      title: Text(file.name),
                      subtitle: isVideo ? Text(_formatFileSize(file.size)) : null,
                      trailing: isVideo
                              ? IconButton(
                                  icon: const Icon(Icons.play_arrow),
                                  onPressed: () => _navigateToVideo(file),
                                )
                          : isFolder
                              ? IconButton(
                                  icon: const Icon(Icons.chevron_right),
                                  onPressed: () => _navigateToFolder(file.id),
                                )
                              : null,
                      onTap: () {
                        if (isVideo) {
                          _navigateToVideo(file);
                        } else if (isFolder) {
                          _navigateToFolder(file.id);
                        }
                      },
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(onPressed: _refreshFiles, tooltip: '更新', child: const Icon(Icons.refresh)),
    );
  }

  Future<void> _loadDriveFiles(String folderId) async {
    try {
      appLogger.info('Google Drive のファイルを読み込み中... (folderId=$folderId)');
      setState(() => _isLoading = true);
      final files = await _driveService.listFolder(folderId: folderId);
      setState(() {
        _files = files;
        _isLoading = false;
      });
      appLogger.info('Google Drive のファイル読み込み完了: ${_files.length} 個');
    } catch (e) {
      appLogger.error('Google Drive のファイル読み込み失敗', e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('読み込み失敗: ' + e.toString()),
          backgroundColor: Colors.red,
        ));
      }
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _refreshFiles() => _loadDriveFiles(_currentFolderId);

  void _navigateToFolder(String folderId) {
    appLogger.info('フォルダに移動: ' + folderId);
    _folderStack.add(folderId);
    _loadDriveFiles(_currentFolderId);
  }

  void _goBackFolder() {
    if (_folderStack.length > 1) {
      appLogger.info('親フォルダに戻る');
      _folderStack.removeLast();
      _loadDriveFiles(_currentFolderId);
    }
  }

  void _onBackPressed() {
    if (_folderStack.length > 1) {
      _goBackFolder();
    } else {
      context.go('/');
    }
  }

  String _getDisplayTitle() => _folderStack.length == 1 ? 'Google Drive' : ' ${_folderStack.last} ';

  // TODO: 共通ユーティリティへ移動する
  String _formatFileSize(num? bytes) {
    final size = bytes ?? 0;
    if (size < 1024) {
      return '$size B';
    }
    if (size < 1024 * 1024) {
      return '${(size / 1024).toStringAsFixed(2)} KB';
    }
    if (size < 1024 * 1024 * 1024) {
      return '${(size / (1024 * 1024)).toStringAsFixed(2)} MB';
    }
    return '${(size / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  bool _isVideo(FileItemDto file) => (file.mimeType ?? '').contains('video');
  bool _isFolder(FileItemDto file) => (file.mimeType ?? '').contains(_folderMimeType);

  void _navigateToVideo(FileItemDto file) {
    final videoId = file.id;
    final fileName = Uri.encodeComponent(file.name);
    final url = '/watch/$videoId?fileName=$fileName&folderId=$_currentFolderId';
    debugPrint('Navigation URL: $url');
    context.go(url);
  }
}
