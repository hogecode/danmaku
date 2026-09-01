import 'package:dio/dio.dart';
import 'package:flutter_app/core/constants/app_constants.dart';
import 'package:flutter_app/data/models/api_response_model.dart';
import 'package:flutter_app/data/models/danmaku_model.dart';
import 'package:logger/logger.dart';

/// API エラー
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}

/// API サービス
class ApiService {
  late final Dio _dio;
  late final Logger _logger;

  ApiService() {
    _logger = Logger();
    _initDio();
  }

  /// Dio 初期化
  void _initDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout: AppConstants.apiConnectTimeout,
        receiveTimeout: AppConstants.apiReceiveTimeout,
        sendTimeout: AppConstants.apiSendTimeout,
        // CORSプリフライト対策: GETはContent-Typeを指定しない
        // POSTはapplication/jsonを使用
        headers: {
          'Accept': 'application/json',
        },
      ),
    );

    // インターセプター（ロギング）
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // GETリクエストではContent-Typeを削除（CORS対策）
          if (options.method == 'GET') {
            options.headers.remove('content-type');
          }
          _logger.i(
            'API Request: ${options.method} ${options.path}',
            error: options.queryParameters,
          );
          return handler.next(options);
        },
        onResponse: (response, handler) {
          _logger.i(
            'API Response: ${response.statusCode} ${response.requestOptions.path}',
          );
          return handler.next(response);
        },
        onError: (error, handler) {
          _logger.e(
            'API Error: ${error.message}',
            error: error.response?.statusCode,
            stackTrace: StackTrace.current,
          );
          return handler.next(error);
        },
      ),
    );
  }

  /// ダンマク取得
  ///
  /// GET /api/danmaku?video_id=xxx
  Future<List<DanmakuModel>> fetchDanmaku({
    required String videoId,
  }) async {
    // テストモード：モックデータを返す
    if (AppConstants.useMockData) {
      _logger.i('Using mock danmaku data for testing');
      await Future.delayed(const Duration(milliseconds: 500)); // ネットワーク遅延をシミュレート
      return _getMockDanmakuData();
    }

    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/danmaku',
        queryParameters: {
          'video_id': videoId,
        },
      );

      if (response.data == null) {
        throw ApiException('No data received');
      }

      // API レスポンスをパース
      final json = response.data!;
      final apiResponse = ApiResponseModel<dynamic>.fromJson(
        json,
        (obj) => obj,
      );

      if (!apiResponse.isSuccess) {
        throw ApiException(
          apiResponse.msg ?? 'Unknown error',
          apiResponse.code,
        );
      }

      if (apiResponse.data == null) {
        _logger.w('No danmaku data returned');
        return [];
      }

      // 配列形式 [時刻, タイプ, 色, 著者, テキスト, サイズ] をパース
      return _parseDanmakuArray(apiResponse.data as List<dynamic>);
    } on DioException catch (e) {
      throw ApiException(
        'Network error: ${e.message}',
        e.response?.statusCode,
      );
    } catch (e) {
      throw ApiException('Failed to fetch danmaku: $e');
    }
  }

  /// 配列形式のダンマクをパース
  List<DanmakuModel> _parseDanmakuArray(List<dynamic> rawData) {
    return rawData.map((item) {
      if (item is! List || item.isEmpty) {
        return null;
      }

      try {
        return DanmakuModel(
          time: (item[0] as num).toDouble(),
          type: item.length > 1 ? item[1] as String : 'right',
          color: item.length > 2 ? item[2] as String : '#ffeaea',
          author: item.length > 3 ? item[3] as String : 'Anonymous',
          text: item.length > 4 ? item[4] as String : '',
          size: item.length > 5 ? item[5] as String : 'medium',
        );
      } catch (e) {
        _logger.e('Failed to parse danmaku item: $item', error: e);
        return null;
      }
    }).whereType<DanmakuModel>().toList();
  }

  /// モックダンマクデータを取得（テスト用）
  List<DanmakuModel> _getMockDanmakuData() {
    return [
      DanmakuModel(
        time: 2.0,
        type: 'right',
        color: '#ffeaea',
        author: 'User1',
        text: 'ようこそ',
        size: 'medium',
      ),
      DanmakuModel(
        time: 5.0,
        type: 'right',
        color: '#ffcccc',
        author: 'User2',
        text: 'いい動画ですね！',
        size: 'medium',
      ),
      DanmakuModel(
        time: 8.0,
        type: 'top',
        color: '#ffe5e5',
        author: 'User3',
        text: 'これはすごい',
        size: 'small',
      ),
      DanmakuModel(
        time: 12.0,
        type: 'right',
        color: '#ffd9d9',
        author: 'User4',
        text: 'このコンテンツ大好きです',
        size: 'medium',
      ),
      DanmakuModel(
        time: 15.0,
        type: 'bottom',
        color: '#ffcdcd',
        author: 'User5',
        text: '素晴らしい作品！',
        size: 'small',
      ),
      DanmakuModel(
        time: 20.0,
        type: 'right',
        color: '#ffc1c1',
        author: 'User6',
        text: 'もっと動画を楽しみにしています',
        size: 'medium',
      ),
    ];
  }

  /// Dio のクリーンアップ
  void dispose() {
    _dio.close();
  }
}
