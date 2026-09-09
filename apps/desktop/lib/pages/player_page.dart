import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:desktop/core/logger/app_logger.dart';
import 'package:desktop/core/constants/app_constants.dart';
import 'package:desktop/services/token_storage.dart';
import 'package:desktop/widgets/video_player/player_page.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PlayerPage extends ConsumerStatefulWidget {
  final String videoId;  // Google Drive のファイルID
  final String folderId;  // 動画が存在するフォルダID
  final String? fileName;

  const PlayerPage({
    Key? key,
    required this.videoId,
    this.folderId = '',  // デフォルト値を空文字列に
    this.fileName,
  }) : super(key: key);

  @override
  ConsumerState<PlayerPage> createState() => _PlayerPageState();
}


class _PlayerPageState extends ConsumerState<PlayerPage> {
  late Future<String> _videoUrlFuture;

  @override
  void initState() {
    super.initState();
    // 非同期でトークンを取得して、ビデオURLを構築
    _videoUrlFuture = _buildStreamUrlAsync(widget.videoId);
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<String>(
        future: _videoUrlFuture,
        builder: (context, snapshot) {
          // ローディング中の表示
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Scaffold(
              appBar: AppBar(
                title: const Text('読み込み中'),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => _handlePop(context),
                ),
              ),
              body: const Center(
                child: CircularProgressIndicator(),
              ),
            );
          }
          // エラー時の表示
          if (snapshot.hasError) {
            return Scaffold(
              appBar: AppBar(
                title: const Text('エラー'),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => _handlePop(context),
                ),
              ),
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error, size: 64, color: Colors.red),
                    const SizedBox(height: 16),
                    Text('URL生成エラー: ${snapshot.error}'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => _handlePop(context),
                      child: const Text('戻る'),
                    ),
                  ],
                ),
              ),
            );
          }

          final videoUrl = snapshot.data ?? '';
          appLogger.info('PlayerPage: ストリーミングURL構築: $videoUrl');

          // ビデオプレイヤーの表示
          return Scaffold(
            appBar: AppBar(
              title: Text(widget.fileName ?? '動画'),
              // TODO: なぜかエラーになるので修正する
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => _handlePop(context),
              ),
            ),
            body: VideoPlayerPage(
              videoUrl: videoUrl,
              videoFileId: widget.videoId,
              folderId: widget.folderId,
              fileName: widget.fileName,
            ),
          );
        },
      );

  /// ナビゲーションスタックをチェックしてpopする
  void _handlePop(BuildContext context) {
    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    } else {
      appLogger.warning('ナビゲーションスタックが空です。アプリを終了します。');
      // スタックが空の場合はアプリを終了するか、ホーム画面に遷移
      // 以下はプッシュして遷移する例：
      // Navigator.pushReplacementNamed(context, '/');
    }
  }

  /// 非同期でストリーミングURLを構築
  /// 1. バックエンドから動画トークンを取得
  /// 2. URL パラメータにトークンを含める
  Future<String> _buildStreamUrlAsync(String fileId) async {
    try {
      debugPrint('🔨 Building streaming URL async for fileId: $fileId');

      // ステップ1: トークンを取得
      final tokenStorage = TokenStorage();
      final accessToken = await tokenStorage.getToken();

      if (accessToken == null) {
        throw Exception('Access token not found');
      }

      debugPrint('🔐 Access token retrieved (length: ${accessToken.length})');

      // ステップ2: バックエンドから動画トークンを生成
      debugPrint('🎬 Requesting video token from backend...');
      final response = await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/api/auth/video-token'),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) {
        throw Exception(
          'Failed to get video token: ${response.statusCode} ${response.body}',
        );
      }

      final jsonResponse = jsonDecode(response.body) as Map<String, dynamic>;
      final videoToken = jsonResponse['token'] as String?;

      if (videoToken == null) {
        throw Exception('Video token not in response');
      }

      debugPrint('✅ Video token obtained (length: ${videoToken.length})');

      // ステップ3: ストリーミング URL を構築
      const baseUrl = AppConstants.apiBaseUrl;
      final url =
          '$baseUrl/api/player/stream/$fileId?token=${Uri.encodeComponent(videoToken)}';

      debugPrint('🔗 Streaming URL built: $url');
      return url;
    } catch (e) {
      debugPrint('❌ Failed to build streaming URL: $e');
      rethrow;
    }
  }
}


