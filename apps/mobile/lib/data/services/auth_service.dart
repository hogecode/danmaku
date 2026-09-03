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
    // テストモード：モックデータを返す
    if (AppConstants.useMockData) {
      _logger.i(
          'Using mock login data for testing');
      await Future.delayed(
        const Duration(
            milliseconds: 500),
      );
      return LoginResponseModel(
        authorizeUrl:
            'https://accounts.google.com/o/oauth2/v2/auth?client_id=test&redirect_uri=http://localhost:3000/callback&response_type=code&scope=openid',
        state:
            'test_state_123456789',
        expiresIn: 3600,
      );
    }

    try {
      _logger.i(
        'Logging in to ${AppConstants.apiBaseUrl}/api/auth/login',
      );

      final response = await _dio
          .post<Map<String, dynamic>>(
        '/api/auth/login',
      );

      if (response.data == null) {
        throw AuthException(
            'No data received');
      }

      return LoginResponseModel
          .fromJson(response.data!);
    } on DioException catch (e) {
      _logger.e(
        'DioException during login',
        error: e,
        stackTrace: StackTrace
            .current,
      );
      throw AuthException(
        _formatDioError(e),
        e.response?.statusCode,
      );
    } catch (e) {
      _logger.e(
        'Unexpected error during login',
        error: e,
        stackTrace: StackTrace
            .current,
      );
      throw AuthException(
          'Failed to login: $e');
    }
  }

  /// ユーザー情報取得
  /// GET /api/auth/me
  Future<UserModel> getUserInfo() async {
    // テストモード：モックデータを返す
    if (AppConstants.useMockData) {
      _logger.i(
          'Using mock user data for testing');
      await Future.delayed(
        const Duration(
            milliseconds: 500),
      );
      return UserModel(
        id: 'test_user_id_123',
        email: 'test@example.com',
        name: 'Test User',
        pictureUrl:
            'https://lh3.googleusercontent.com/a/default-user',
        oauthProvider: 'google',
        lastLogin: DateTime.now(),
        createdAt:
            DateTime.now().subtract(
          const Duration(days: 30),
        ),
      );
    }

    try {
      _logger.i(
        'Fetching user info from ${AppConstants.apiBaseUrl}/api/auth/me',
      );

      final response = await _dio
          .get<Map<String, dynamic>>(
        '/api/auth/me',
      );

      if (response.data == null) {
        throw AuthException(
            'No data received');
      }

      return UserModel
          .fromJson(response.data!);
    } on DioException catch (e) {
      _logger.e(
        'DioException while fetching user info',
        error: e,
        stackTrace: StackTrace
            .current,
      );
      throw AuthException(
        _formatDioError(e),
        e.response?.statusCode,
      );
    } catch (e) {
      _logger.e(
        'Unexpected error while fetching user info',
        error: e,
        stackTrace: StackTrace
            .current,
      );
      throw AuthException(
          'Failed to get user info: $e');
    }
  }

  /// ログアウト
  /// POST /api/auth/logout
  Future<void> logout() async {
    try {
      _logger.i(
        'Logging out from ${AppConstants.apiBaseUrl}/api/auth/logout',
      );

      await _dio.post(
        '/api/auth/logout',
      );
      _logger.i(
          'Logged out successfully');
    } on DioException catch (e) {
      _logger.e(
        'DioException during logout',
        error: e,
        stackTrace: StackTrace
            .current,
      );
      throw AuthException(
        _formatDioError(e),
        e.response?.statusCode,
      );
    } catch (e) {
      _logger.e(
        'Unexpected error during logout',
        error: e,
        stackTrace: StackTrace
            .current,
      );
      throw AuthException(
          'Failed to logout: $e');
    }
  }

  /// Dio エラーをフォーマット
  String _formatDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType
            .connectionTimeout:
        return 'Connection timeout. Check your network.';
      case DioExceptionType
            .sendTimeout:
        return 'Send timeout. Request took too long.';
      case DioExceptionType
            .receiveTimeout:
        return 'Receive timeout. Server is slow.';
      case DioExceptionType
            .badResponse:
        return 'Bad response (${e.response?.statusCode}): ${e.response?.statusMessage}';
      case DioExceptionType.cancel:
        return 'Request cancelled.';
      case DioExceptionType.unknown:
        return 'Network error: ${e.message}';
      default:
        return 'Unknown error: ${e.message}';
    }
  }

  /// Dio クリーンアップ
  void dispose() {
    _dio.close();
  }
}
