import 'dart:convert';

import 'package:desktop/core/logger/app_logger.dart';
import 'package:desktop/data/client/lib/api.dart';
import 'package:desktop/services/token_bearer_http_client.dart';
import 'package:desktop/services/token_storage.dart';

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
    appLogger.info('DriveService: basePath=$basePath');

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
  /// @return FileItemDtoのリスト
  Future<List<FileItemDto>> listFolder({String folderId = 'root'}) async {
    try {
      appLogger.info('DriveService: フォルダ一覧を取得中 (folderId=$folderId)');

      // OpenAPI クライアント使用（自動生成）
      // HTTPレスポンスを取得してデシリアライゼーション時のエラーを回避
      final response = await _gDriveApi.gDriveControllerListFolderWithHttpInfo(
        folderId: folderId,
      );

      if (response.statusCode != null && response.statusCode! >= 400) {
        throw DriveException(
          'API Error: ${response.statusCode}',
          response.statusCode,
        );
      }

      // レスポンスボディをJSON として取得
      if (response.body.isEmpty) {
        appLogger.warning('DriveService: フォルダが空です');
        return [];
      }

      // JSON デコード（自動生成コードのバグを回避）
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final items = <FileItemDto>[];

      if (json['items'] is List) {
        for (final item in json['items'] as List) {
          try {
            // アイテムを手動でマッピング（デシリアライゼーション エラーを回避）
            items.add(
              FileItemDto(
                id: item['id'] ?? '',
                name: item['name'] ?? 'Unknown',
                mimeType: item['mimeType'] ?? '',
                size: _parseSize(item['size']),
                modifiedTime: item['modifiedTime'] ?? '',
                webViewLink: item['webViewLink'] ?? '',
                thumbnailLink: item['thumbnailLink'] as String?,
                parentId: item['parentId'] as String?,
              ),
            );
          } catch (e) {
            appLogger.warning('DriveService: アイテムのマッピング失敗: $e');
            continue;
          }
        }
      }

      appLogger.info('DriveService: フォルダ一覧取得成功: ${items.length} 個');
      return items;
    } catch (e) {
      appLogger.error('DriveService: フォルダ一覧取得失敗', e);
      rethrow;
    }
  }

  /// Google Drive でキーワード検索
  ///
  /// GET /api/gdrive/search
  /// @param folderId 検索対象フォルダID
  /// @param query 検索キーワード
  /// @return FileItemDto（OpenAPI 自動生成モデル）のリスト
  Future<List<FileItemDto>> search({
    required String folderId,
    required String query,
  }) async {
    try {
      appLogger.info(
        'DriveService: 検索実行中 (folderId=$folderId, query=$query)',
      );

      // HTTPレスポンスを取得してデシリアライゼーション時のエラーを回避
      final response = await _gDriveApi.gDriveControllerSearchWithHttpInfo(
        folderId,
        query,
      );

      if (response.statusCode != null && response.statusCode! >= 400) {
        throw DriveException(
          'API Error: ${response.statusCode}',
          response.statusCode,
        );
      }

      // レスポンスボディをJSON として取得
      if (response.body.isEmpty) {
        appLogger.warning('DriveService: 検索結果なし');
        return [];
      }

      // JSON デコード（自動生成コードのバグを回避）
      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final items = <FileItemDto>[];

      if (json['items'] is List) {
        for (final item in json['items'] as List) {
          try {
            // アイテムを手動でマッピング（デシリアライゼーション エラーを回避）
            items.add(
              FileItemDto(
                id: item['id'] ?? '',
                name: item['name'] ?? 'Unknown',
                mimeType: item['mimeType'] ?? '',
                size: _parseSize(item['size']),
                modifiedTime: item['modifiedTime'] ?? '',
                webViewLink: item['webViewLink'] ?? '',
                thumbnailLink: item['thumbnailLink'] as String?,
                parentId: item['parentId'] as String?,
              ),
            );
          } catch (e) {
            appLogger.warning('DriveService: アイテムのマッピング失敗: $e');
            continue;
          }
        }
      }

      appLogger.info('DriveService: 検索完了: ${items.length} 件');
      return items;
    } catch (e) {
      appLogger.error('DriveService: 検索失敗', e);
      rethrow;
    }
  }

  /// size を安全にパース（null対応）
  num? _parseSize(dynamic value) {
    if (value == null) return null;
    if (value is num) return value;
    if (value is String) {
      try {
        return num.parse(value);
      } catch (e) {
        appLogger.warning('DriveService: size パース失敗: $value');
        return null;
      }
    }
    return null;
  }
}
