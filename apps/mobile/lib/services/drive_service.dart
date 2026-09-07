import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:mobile/data/client/lib/api.dart';
import 'package:mobile/services/token_bearer_http_client.dart';
import 'package:mobile/services/token_storage.dart';

final _logger = Logger();

/// Google Drive ファイルモデル
// TODO: OpenAPIの自動生成モデルを使うように変更
class DriveFile {
  final String id;
  final String name;
  final String? modifiedTime;
  final bool isVideo;
  final String? thumbnailLink;
  final String? webViewLink;

  DriveFile({
    required this.id,
    required this.name,
    this.modifiedTime,
    required this.isVideo,
    this.thumbnailLink,
    this.webViewLink,
  });
}

/// Google Drive エラー
class DriveException implements Exception {
  final String message;
  final int? statusCode;

  DriveException(this.message, [this.statusCode]);

  @override
  String toString() => 'DriveException: $message (status: $statusCode)';
}

/// Google Drive サービス
///
/// OpenAPI 自動生成クライアントを使用
/// TokenBearerHttpClient で JWT トークンを自動付与
class DriveService {
  late final ApiClient _apiClient;
  late final GDriveApi _gDriveApi;
  late final TokenStorage _tokenStorage;

  DriveService() {
    // TokenStorage 初期化
    _tokenStorage = TokenStorage();

    // OpenAPI クライアント初期化
    final basePath = _getServerBasePath();
    _logger.i('DriveService: basePath=$basePath');

    // TokenBearerHttpClient で JWT トークンを自動付与
    final httpClient = TokenBearerHttpClient(_tokenStorage);
    _apiClient = ApiClient(basePath: basePath);
    _apiClient.client = httpClient;
    _apiClient.addDefaultHeader('X-Client-Type', 'flutter');

    // GDrive API 初期化
    _gDriveApi = GDriveApi(_apiClient);
  }

  /// プラットフォームに応じてサーバーの basePath を取得
  String _getServerBasePath() {
    return 'http://api.danmaku.cloud:3001';
  }

  /// Google Drive フォルダ内のファイル一覧を取得
  ///
  /// GET /api/gdrive/list
  /// @param folderId フォルダID（デフォルト: 'root'）
  /// @return DriveFile のリスト
  Future<List<DriveFile>> listFolder({String folderId = 'root'}) async {
    try {
      _logger.i('DriveService: フォルダ一覧を取得中 (folderId=$folderId)');

      // OpenAPI で GET /api/gdrive/list を呼び出し
      final response = await _gDriveApi.gDriveControllerListFolderWithHttpInfo(
        folderId,
      );

      // ステータスコード確認
      if (response.statusCode == null || response.statusCode! >= 400) {
        throw DriveException(
          'Failed to list folder',
          response.statusCode,
        );
      }

      // レスポンスボディをJSON デコード
      if (response.body.isEmpty) {
        throw DriveException('No data received from list folder endpoint');
      }

      final data = jsonDecode(response.body);
      _logger.i('DriveService: レスポンス受信: $data');

      // items の配列をマッピング
      if (data is! Map<String, dynamic> || data['items'] is! List) {
        throw DriveException('Invalid response format from server');
      }

      final items = (data['items'] as List)
          .map((item) => _mapFileItemDtoToDriveFile(item))
          .toList();

      _logger.i('DriveService: フォルダ一覧取得成功: ${items.length} 個');
      return items;
    } catch (e) {
      _logger.e('DriveService: フォルダ一覧取得失敗', error: e);
      rethrow;
    }
  }

  /// Google Drive でキーワード検索
  ///
  /// GET /api/gdrive/search
  /// @param folderId 検索対象フォルダID
  /// @param query 検索キーワード
  /// @return DriveFile のリスト
  Future<List<DriveFile>> search({
    required String folderId,
    required String query,
  }) async {
    try {
      _logger.i(
        'DriveService: 検索実行中 (folderId=$folderId, query=$query)',
      );

      // GET /api/gdrive/search を呼び出し
      final response = await _gDriveApi.gDriveControllerSearchWithHttpInfo(
        folderId,
        query,
      );

      // ステータスコード確認
      if (response.statusCode == null || response.statusCode! >= 400) {
        throw DriveException(
          'Failed to search in folder',
          response.statusCode,
        );
      }

      // レスポンスボディをJSON デコード
      if (response.body.isEmpty) {
        throw DriveException('No data received from search endpoint');
      }

      final data = jsonDecode(response.body);
      _logger.i('DriveService: 検索レスポンス受信: $data');

      // items の配列をマッピング
      if (data is! Map<String, dynamic> || data['items'] is! List) {
        throw DriveException('Invalid response format from server');
      }

      final items = (data['items'] as List)
          .map((item) => _mapFileItemDtoToDriveFile(item))
          .toList();

      _logger.i('DriveService: 検索完了: ${items.length} 件');
      return items;
    } catch (e) {
      _logger.e('DriveService: 検索失敗', error: e);
      rethrow;
    }
  }

  /// FileItemDto を DriveFile にマッピング
  DriveFile _mapFileItemDtoToDriveFile(dynamic item) {
    final id = item['id'] as String;
    final name = item['name'] as String;
    final mimeType = item['mimeType'] as String;
    final modifiedTime = item['modifiedTime'] as String?;
    final thumbnailLink = item['thumbnailLink'] as String?;
    final webViewLink = item['webViewLink'] as String?;

    // フォルダかビデオかを判定
    final isVideo = mimeType.contains('video');

    return DriveFile(
      id: id,
      name: name,
      modifiedTime: modifiedTime,
      isVideo: isVideo,
      thumbnailLink: thumbnailLink,
      webViewLink: webViewLink,
    );
  }
}
