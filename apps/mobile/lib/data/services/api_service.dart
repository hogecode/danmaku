import 'package:dio/dio.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/data/models/api_response_model.dart';
import 'package:mobile/data/models/danmaku_model.dart';
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
    final mockData = <DanmakuModel>[];
    final comments = [
      'ようこそ',
      'いい動画ですね！',
      'これはすごい',
      'このコンテンツ大好きです',
      '素晴らしい作品！',
      'もっと動画を楽しみにしています',
      '最高',
      '涙が出た',
      'これほんと好き',
      'マジで天才',
      '感動しました',
      'また見たい',
      '面白すぎる',
      'ありがとう',
      '何回見ても飽きない',
      '心に残る作品',
      '素晴らしい',
      'うわぁ...',
      '凄い...',
      'これだ！',
      '良作だな',
      'さすが',
      '神作',
      'ハマった',
      'リピート決定',
      'バイバイ',
      'おわり',
      '続きが気になる',
      'このシーン最高',
      'ずっと好きです',
      '絶対また見る',
      'この声優いいな',
      '音楽いい',
      '背景綺麗',
      'ストーリー最高',
      'キャラが可愛い',
      'あぁ〜',
      'ｗｗｗ',
      'ｌｏｌ',
      '知ってた',
      'うんうん',
      'そうそう',
      'ですね',
      '同感',
      'その通り',
      '完璧',
      '違和感ない',
      'クオリティ高い',
      'プロの仕業',
      'こういうのが好き',
    ];

    // 20秒にわたって、ランダムなタイミングでコメントを生成
    for (int i = 0; i < 50; i++) {
      final randomTime = (i * 0.4 + (i % 3) * 0.2) % 20.0;
      final randomComment = comments[i % comments.length];
      final randomAuthor = 'User${i + 1}';
      final colorIndex = i % 8;
      final colors = [
        '#ffeaea', // ピンク
        '#ffcccc', // ライトピンク
        '#ffe5e5', // ライトピンク2
        '#ffd9d9', // ライトピンク3
        '#ffcdcd', // ライトピンク4
        '#ffc1c1', // ライトピンク5
        '#ffffcc', // ライトイエロー
        '#ccffcc', // ライトグリーン
      ];
      final typeIndex = i % 4;
      final types = ['right', 'right', 'right', 'top'];

      mockData.add(
        DanmakuModel(
          time: randomTime,
          type: types[typeIndex],
          color: colors[colorIndex],
          author: randomAuthor,
          text: randomComment,
          size: i % 5 == 0 ? 'big' : (i % 3 == 0 ? 'small' : 'medium'),
        ),
      );
    }

    // タイムスタンプでソート
    mockData.sort((a, b) => a.time.compareTo(b.time));
    return mockData;
  }

  /// Dio のクリーンアップ
  void dispose() {
    _dio.close();
  }
}
