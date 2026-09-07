import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/services/token_storage.dart';
import 'package:mobile/widgets/video_player/player_page.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

final _logger = Logger();

class PlayerPage extends ConsumerStatefulWidget {
  final String videoId;  // Google Drive のファイルID
  final String? fileName;

  const PlayerPage({
    Key? key,
    required this.videoId,
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
    // 非同期でビデオURLを構築
    _videoUrlFuture = _buildStreamUrlAsync(widget.videoId);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: _videoUrlFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (snapshot.hasError) {
          return Scaffold(
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('URL生成エラー: ${snapshot.error}'),
                ],
              ),
            ),
          );
        }

        final videoUrl = snapshot.data ?? '';
        _logger.i('PlayerPage: ストリーミングURL構築: $videoUrl');
        debugPrint('🔗 Final URL: $videoUrl');

        return VideoPlayerPage(
          videoUrl: videoUrl,
          fileName: widget.fileName,
        );
      },
    );
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
      final String baseUrl = AppConstants.apiBaseUrl;
      final String url =
          '$baseUrl/api/player/stream/$fileId?token=${Uri.encodeComponent(videoToken)}';

      debugPrint('🔗 Streaming URL built: $url');
      return url;
    } catch (e) {
      debugPrint('❌ Failed to build streaming URL: $e');
      rethrow;
    }
  }
}

