import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/presentation/pages/home_page.dart';
import 'package:mobile/presentation/providers/auth_provider.dart';
import 'package:mobile/presentation/providers/ui_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginPage> createState() =>
      _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  String? _error;

  @override
  Widget build(BuildContext context) {
    final isDark =
        ref.watch(darkModeProvider);
    final loading =
        ref.watch(authLoadingProvider);

    ref.listen<bool>(
        isAuthenticatedProvider,
        (p, n) {
      if (n && !loading) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                const HomePage(),
          ),
        );
      }
    });

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF1A1A1A)
          : const Color(0xFFF5F5F5),
      body: Center(
        child: SingleChildScrollView(
          padding:
              const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment:
                MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.ondemand_video,
                size: 80,
                color: Colors.blue,
              ),
              const SizedBox(height: 24),
              Text(
                'Danmaku',
                style: Theme.of(context)
                    .textTheme
                    .headlineLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Google OAuth でログイン',
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium,
              ),
              const SizedBox(height: 48),
              if (_error != null)
                Container(
                  padding:
                      const EdgeInsets
                          .all(12),
                  color: Colors.red
                      .withOpacity(0.2),
                  child: Text(
                    _error!,
                    style:
                        const TextStyle(
                      color: Colors.red,
                    ),
                  ),
                ),
              if (_error != null)
                const SizedBox(height: 24),
              ElevatedButton(
                onPressed: loading
                    ? null
                    : () => _login(),
                style:
                    ElevatedButton
                        .styleFrom(
                  padding:
                      const EdgeInsets
                          .symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                ),
                child: loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child:
                            CircularProgressIndicator(
                          strokeWidth:
                              2,
                        ),
                      )
                    : Row(
                        mainAxisSize:
                            MainAxisSize
                                .min,
                        children: const [
                          Icon(Icons
                              .login),
                          SizedBox(
                              width: 8),
                          Text(
                            'Google でログイン',
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _login() async {
    try {
      setState(
          () => _error = null);

      // ステップ1: ログイン処理
      final loginResult = await ref
          .read(loginProvider.future);

      if (mounted) {
        ScaffoldMessenger.of(
                context)
            .showSnackBar(
          SnackBar(
            content: Text(
              'OAuth URL: ${loginResult.url}',
              maxLines: 3,
            ),
            duration: const Duration(
                seconds: 5),
          ),
        );

        // ステップ2: 2秒待機
        await Future.delayed(
          const Duration(seconds: 2),
        );

        // ステップ3: ユーザー情報取得
        try {
          await ref
              .read(
                  fetchUserProvider.future)
              .then((u) {
            // 状態を更新
            ref
                .read(currentUserProvider
                    .notifier)
                .state = u;
            ref
                .read(
                    isAuthenticatedProvider
                        .notifier)
                .state = true;
          });

          if (mounted) {
            ScaffoldMessenger.of(
                    context)
                .showSnackBar(
              const SnackBar(
                content: Text(
                    'ログイン成功'),
                duration:
                    Duration(
                        seconds: 2),
              ),
            );
          }
        } catch (e) {
          setState(() {
            _error =
                'ユーザー情報取得失敗: $e';
          });
        }
      }
    } catch (e) {
      setState(() {
        _error =
            'ログイン失敗: $e';
      });
    }
  }
}


