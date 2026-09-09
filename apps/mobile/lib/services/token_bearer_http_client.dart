import 'package:http/http.dart' as http;
import 'package:mobile/core/logger/app_logger.dart';
import 'token_storage.dart';

/// JWT トークンを Authorization ヘッダーで自動送信する HTTP クライアント
class TokenBearerHttpClient extends http.BaseClient {
  final http.Client _inner = http.Client();
  final TokenStorage _tokenStorage;
  
  TokenBearerHttpClient(this._tokenStorage);
  
  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    // トークンを読み込み、Authorization ヘッダーに追加
    final token = await _tokenStorage.getToken();
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
      appLogger.debug('[TokenBearerClient] 🔐 Authorization header を付与');
    }
    
    // リクエスト実行
    return _inner.send(request);
  }
}
