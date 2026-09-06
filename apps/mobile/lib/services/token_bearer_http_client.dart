import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'token_storage.dart';

final _logger = Logger();

/// JWT トークンを Authorization ヘッダーで自動送信する HTTP クライアント
class TokenBearerHttpClient extends http.BaseClient {
  final http.Client _inner = http.Client();
  final TokenStorage _tokenStorage;
  
  TokenBearerHttpClient(this._tokenStorage);
  
  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    _logger.d('[TokenBearerClient] ========== HTTP Request ==========');
    _logger.d('[TokenBearerClient] ${request.method} ${request.url}');
    
    // トークンを読み込み、Authorization ヘッダーに追加
    final token = await _tokenStorage.getToken();
    if (token != null && token.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
      _logger.i('[TokenBearerClient] 🔐 Authorization header を付与');
    } else {
      _logger.w('[TokenBearerClient] ⚠️ トークンが保存されていません');
    }
    
    // リクエスト実行
    return _inner.send(request).then((response) {
      _logger.d('[TokenBearerClient] Response Status: ${response.statusCode}');
      return response;
    });
  }
}
