import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';
import 'package:mobile/data/client/lib/api.dart';
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
  late List<FileItemDto> _files = [];
  bool _isLoading = true;
  
  // フォルダナビゲーション用
  late List<String> _folderStack = ['root'];
  String get _currentFolderId => _folderStack.last;

  // MIME Type 定数
  static const String _folderMimeType = 'application/vnd.google-apps.folder';

  @override
  void initState() {
    super.initState();
    _logger.i('Google Drive ページを初期化');
    // ログイン状態を確認してからファイルを読み込む
    Future.microtask(() {
      final authState = ref.read(authProvider);
      if (!authState.isAuthenticated) {
        _logger.w('Google Drive ページ: ユーザーがログインしていません');
        context.go('/login');
      } else {
        _loadDriveFiles(_currentFolderId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = ref.watch(darkModeProvider);
    final authState = ref.watch(authProvider);
    
    // ログインしていない場合はローディング画面を表示
    if (!authState.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Google Drive'),
          elevation: 0,
        ),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      // TODO: Widget分ける
      appBar: AppBar(
        title: Text(_getDisplayTitle()),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _onBackPressed,
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
                    final isVideo = _isVideo(file);
                    final isFolder = _isFolder(file);
                    
                    return ListTile(
                      leading: Icon(
                        isVideo ? Icons.videocam : Icons.folder,
                        color: Colors.blue,
                      ),
                      title: Text(file.name ?? 'Unknown'),
                      subtitle: Text(file.modifiedTime ?? 'Unknown'),
                      trailing: isVideo
                          ? IconButton(
                              icon: const Icon(Icons.play_arrow),
                              onPressed: () {
                                context.go(
                                  '/watch/${file.id}?fileName=${file.name}',
                                );
                              },
                            )
                          : isFolder
                              ? IconButton(
                                  icon: const Icon(Icons.chevron_right),
                                  onPressed: () {
                                    _navigateToFolder(file.id ?? '');
                                  },
                                )
                              : null,
                      onTap: () {
                        if (isVideo) {
                          context.go(
                            '/watch/${file.id}?fileName=${file.name}',
                          );
                        } else if (isFolder) {
                          _navigateToFolder(file.id ?? '');
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
  Future<void> _loadDriveFiles(String folderId) async {
    try {
      _logger.i('Google Drive のファイルを読み込み中... (folderId=$folderId)');
      setState(() => _isLoading = true);

      // DriveService でファイル一覧を取得
      final files = await _driveService.listFolder(folderId: folderId);

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
    await _loadDriveFiles(_currentFolderId);
  }

  /// フォルダナビゲーション
  void _navigateToFolder(String folderId) {
    _logger.i('フォルダに移動: $folderId');
    _folderStack.add(folderId);
    _loadDriveFiles(_currentFolderId);
  }

  /// 親フォルダに戻る
  void _goBackFolder() {
    if (_folderStack.length > 1) {
      _logger.i('親フォルダに戻る');
      _folderStack.removeLast();
      _loadDriveFiles(_currentFolderId);
    }
  }

  /// 戻るボタンのアクション
  void _onBackPressed() {
    if (_folderStack.length > 1) {
      _goBackFolder();
    } else {
      context.go('/');
    }
  }

  /// 現在のフォルダのタイトルを取得
  String _getDisplayTitle() {
    if (_folderStack.length == 1) {
      return 'Google Drive';
    }
    // 最後のフォルダIDを表示（本来はフォルダ名を取得してもよい）
    return 'Google Drive / ${_files.isNotEmpty ? _files.first.parentId ?? 'Subfolder' : 'Subfolder'}';
  }

  /// ファイルがビデオかどうか
  bool _isVideo(FileItemDto file) {
    return (file.mimeType ?? '').contains('video');
  }

  /// ファイルがフォルダかどうか
  bool _isFolder(FileItemDto file) {
    return (file.mimeType ?? '').contains(_folderMimeType);
  }
}
