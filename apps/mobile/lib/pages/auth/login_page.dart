import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:logger/logger.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/auth_notifier.dart';
import 'package:mobile/providers/ui_provider.dart';

final _logger = Logger();

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}


class _LoginPageState extends ConsumerState<LoginPage> with WidgetsBindingObserver {
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // アプリがフォアグラウンドに戻った時に認証確認
      _checkAuthStatus();
    }
  }



  @override
  Widget build(BuildContext context) {
    final isDark = ref.watch(darkModeProvider);
    final auth = ref.watch(authProvider);
    final loading = auth.loading;

    // ログイン成功時にホーム画面に遷移
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next.isAuthenticated) {
        context.go('/');
      }
    });

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF1A1A1A) : const Color(0xFFF5F5F5),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 動画アイコン
              const Icon(Icons.ondemand_video, size: 80, color: Colors.blue),
              const SizedBox(height: 24),
              // アプリ名
              Text('Danmaku',
                  style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 8),
              const SizedBox(height: 48),
              if (_error != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  color: Colors.red.withOpacity(0.2),
                  child: SingleChildScrollView(
                    child: Text(_error!,
                        style: const TextStyle(
                            color: Colors.red, fontSize: 12)),
                  ),
                ),
              if (_error != null) const SizedBox(height: 24),
              ElevatedButton(
                // Google OAuth ログインボタン
                onPressed: loading ? null : _login,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 32, vertical: 16),
                ),
                child: loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.login),
                          SizedBox(width: 8),
                          Text('Google ログイン'),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  /// ログイン処理
  Future<void> _login() async {
    try {
      setState(() => _error = null);

      _logger.i('[LoginPage] ログイン開始');

      // OAuth URL を取得
      final loginResult = await ref.read(authProvider.notifier).login();

      _logger.i('[LoginPage] OAuth URL 取得成功');

      // レスポンス: {authorize_url, state, expires_in}
      final authorizeUrl = loginResult['authorize_url'] as String?;
      if (authorizeUrl == null) {
        throw Exception('authorize_url が含まれていません');
      }

      // ブラウザで Google OAuth を開く
      final uri = Uri.parse(authorizeUrl);
      //_logger.i('[LoginPage] OAuth URL: $authorizeUrl');
      
      // Android エミュレータ / デバイスの場合
      if (!await canLaunchUrl(uri)) {
        _logger.e('[LoginPage] URL を開くことができません: $uri');
        throw Exception('OAuth URL を開くことができません');
      }
      
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );

      // ユーザーがブラウザで認証を完了したら、
      // ブラウザを閉じてアプリに戻る
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Google認証を完了してください'),
            duration: Duration(seconds: 10),
          ),
        );
        
        // 1秒後に認証状態を確認（ブラウザがまだ開いている可能性があるため）
        // ユーザーが手動でブラウザを閉じた場合、didChangeAppLifecycleState() で処理される
        Future.delayed(const Duration(seconds: 1), () async {
          if (mounted) {
            await _checkAuthStatus();
          }
        });
      }
    } catch (e) {
      _logger.e('[LoginPage] ログイン失敗', error: e);
      if (mounted) {
        setState(() {
          _error = 'ログイン失敗: $e';
        });
      }
    }
  }

    Future<void> _checkAuthStatus() async {
    try {
      //_logger.i('[LoginPage] ==================== Checking auth status ====================');
      _logger.i('[LoginPage] ブラウザから戻った時のセッション確認を開始');
      
      final notifier = ref.read(authProvider.notifier);
      //_logger.i('[LoginPage] AuthNotifier を取得');
      
      // GET /api/auth/me で認証状態を確認
      final isComplete = await notifier.completeOAuth();
      
      _logger.i('[LoginPage] completeOAuth() 完了: isComplete=$isComplete');
      
      if (isComplete && mounted) {
        _logger.i('[LoginPage] ✅ Auth check success, navigating to home');
        context.go('/');
      } else {
        _logger.w('[LoginPage] ⚠️ Auth check failed (セッションなし): isComplete=$isComplete');
      }
    } catch (e) {
      _logger.w('[LoginPage] ⛔ Auth check failed with error', error: e);
      // エラーは無視（ユーザーは手動でログインできる）
    }
  }
}
