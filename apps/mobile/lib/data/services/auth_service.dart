import 'package:dio/dio.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/data/models/user_model.dart';
import 'package:mobile/data/models/login_response_model.dart';
import 'package:logger/logger.dart';

/// 認証エラー
class AuthException implements Exception {
  final String message;
  final int? statusCode;

  AuthException(this.message, [this.statusCode]);

  @override
  String toString() =>
      'AuthException: $message (status: $statusCode)';
}

/// 認証サービス
class AuthService {
  late final Dio _dio;
  late final Logger _logger;

  AuthService() {
    _logger = Logger();
    _initDio();
  }

  /// Dio 初期化
  void _initDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout:
            AppConstants.apiConnectTimeout,
        receiveTimeout:
            AppConstants.apiReceiveTimeout,
        sendTimeout: AppConstants.apiSendTimeout,
        headers: {
          'Accept': 'application/json',
        },
      ),
    );

    // インターセプター
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (options.method == 'GET') {
            options.headers.remove('content-type');
          }
          _logger.i(
            'Auth Request: ${options.method} ${options.path}',
          );
          return handler.next(options);
        },
        onResponse: (response, handler) {
          _logger.i(
            'Auth Response: ${response.statusCode} ${response.requestOptions.path}',
          );
          return handler.next(response);
        },
        onError: (error, handler) {
          _logger.e(
            'Auth Error: ${error.message}',
            error: error.response?.statusCode,
          );
          return handler.next(error);
        },
      ),
    );
  }

  /// ログイン開始
  /// POST /api/auth/login
  Future<LoginResponseModel> login() async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/auth/login',
      );

      if (response.data == null) {
        throw AuthException('No data received');
      }

      return LoginResponseModel.fromJson(response.data!);
    } on DioException catch (e) {
      throw AuthException(
        'Network error: ${e.message}',
        e.response?.statusCode,
      );
    } catch (e) {
      throw AuthException('Failed to login: $e');
    }
  }

  /// ユーザー情報取得
  /// GET /api/auth/me
  Future<UserModel> getUserInfo() async {
    try {
      final response =
          await _dio.get<Map<String, dynamic>>(
        '/api/auth/me',
      );

      if (response.data == null) {
        throw AuthException('No data received');
      }

      return UserModel.fromJson(response.data!);
    } on DioException catch (e) {
      throw AuthException(
        'Network error: ${e.message}',
        e.response?.statusCode,
      );
    } catch (e) {
      throw AuthException(
          'Failed to get user info: $e');
    }
  }

  /// ログアウト
  /// POST /api/auth/logout
  Future<void> logout() async {
    try {
      await _dio.post(
        '/api/auth/logout',
      );
      _logger.i('Logged out successfully');
    } on DioException catch (e) {
      throw AuthException(
        'Network error: ${e.message}',
        e.response?.statusCode,
      );
    } catch (e) {
      throw AuthException(
          'Failed to logout: $e');
    }
  }

  /// Dio クリーンアップ
  void dispose() {
    _dio.close();
  }
}
