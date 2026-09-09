import 'package:flutter/foundation.dart';
import 'package:mobile/core/logger/app_logger.dart';
import 'package:mobile/data/client/lib/api.dart';
import 'package:mobile/services/token_bearer_http_client.dart';
import 'package:mobile/services/token_storage.dart';

/// ビデオコメント取得エラー
class VideoCommentException implements Exception {
  final String message;
  final int? statusCode;

  VideoCommentException(this.message, [this.statusCode]);

  @override
  String toString() => 'VideoCommentException: $message (status: $statusCode)';
}

/// ビデオ関連サービス
///
/// コメント取得やビデオメタデータ取得を管理
/// OpenAPI 自動生成クライアント (PlayerApi) を使用
/// TokenBearerHttpClient で JWT トークンを自動付与
class VideoService {
  late final ApiClient _apiClient;
  late final PlayerApi _playerApi;
  late final TokenStorage _tokenStorage;

  VideoService() {
    // TokenStorage 初期化
    _tokenStorage = TokenStorage();

    // OpenAPI クライアント初期化
    final basePath = _getServerBasePath();
    debugPrint('[VideoService] basePath=$basePath');

    // TokenBearerHttpClient で JWT トークンを自動付与
    final httpClient = TokenBearerHttpClient(_tokenStorage);
    _apiClient = ApiClient(basePath: basePath);
    _apiClient.client = httpClient;
    _apiClient.addDefaultHeader('X-Client-Type', 'flutter');

    // PlayerApi 初期化
    _playerApi = PlayerApi(_apiClient);
  }

  /// プラットフォームに応じてサーバーの basePath を取得
  String _getServerBasePath() {
    return 'http://api.danmaku.cloud:3001';
  }

  /// 動画のコメント（弾幕）を取得
  ///
  /// GET /api/player/comments/:videoFileId
  /// @param videoFileId 動画ファイル ID (GDrive)
  /// @param folderId コメントが存在するフォルダ ID
  /// @return DPlayer 互換形式のコメント配列
  Future<List<DPlayerCommentDto>> getVideoComments({
    required String videoFileId,
    required String folderId,
  }) async {
    try {
      debugPrint('[VideoService] Fetching comments...');
      debugPrint('[VideoService]   - videoFileId: $videoFileId');
      debugPrint('[VideoService]   - folderId: $folderId');

      // OpenAPI クライアント使用（自動生成）
      final response = await _playerApi.playerControllerGetComments(
        videoFileId,
        folderId,
      );

      if (response == null) {
        debugPrint('[VideoService] ⚠️ Response is null');
        return [];
      }

      final commentList = response.comments ?? [];
      debugPrint('[VideoService] ✅ Successfully fetched ${commentList.length} comments');

      return commentList;
    } catch (error, stackTrace) {
      debugPrint('[VideoService] ❌ Failed to fetch comments');
      debugPrint('[VideoService]    Error: $error');
      debugPrint('[VideoService]    Stack: $stackTrace');

      // API エラーの詳細をログ
      if (error is ApiException) {
        debugPrint('[VideoService]    API Error Code: ${error.code}');
        debugPrint('[VideoService]    API Error Message: ${error.message}');
      }

      // エラー時は空配列を返す（プレイヤーは動作継続）
      return [];
    }
  }

  /// 複数の動画のコメントを一括取得（将来の拡張用）
  ///
  /// @param videoFileIds 動画ファイル ID リスト
  /// @param folderId フォルダ ID
  /// @return 動画ID → コメント配列のマップ
  Future<Map<String, List<DPlayerCommentDto>>> getMultipleVideoComments({
    required List<String> videoFileIds,
    required String folderId,
  }) async {
    final results = <String, List<DPlayerCommentDto>>{};

    for (final videoFileId in videoFileIds) {
      results[videoFileId] = await getVideoComments(
        videoFileId: videoFileId,
        folderId: folderId,
      );
    }

    return results;
  }
}
