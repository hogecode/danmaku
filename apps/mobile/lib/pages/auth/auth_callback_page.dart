import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/logger/app_logger.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/router_provider.dart';

/// ディープリンク受信時のコールバックページ
/// danmaku://auth/callback?user=...&token=...
class AuthCallbackPage extends ConsumerStatefulWidget {
  final String? user;   // JSON エンコードされたユーザー情報
  final String? token;  // JWT アクセストークン

  const AuthCallbackPage({
    Key? key,
    this.user,
    this.token,
  }) : super(key: key);

  @override
  ConsumerState<AuthCallbackPage> createState() => _AuthCallbackPageState();
}


class _AuthCallbackPageState extends ConsumerState<AuthCallbackPage> {
  late Future<void> _authFuture;

  @override
  void initState() {
    super.initState();
    appLogger.info('[AuthCallbackPage] ==================== ディープリンク受信 ====================');
    appLogger.info('[AuthCallbackPage] user provided: ${widget.user != null}');
    appLogger.info('[AuthCallbackPage] token provided: ${widget.token != null}');
    _authFuture = _handleDeepLink();
  }

  Future<void> _handleDeepLink() async {
    try {
      if (widget.user == null || widget.token == null) {
        appLogger.warning('[AuthCallbackPage] ⚠️ user または token が指定されていません');
        if (mounted) {
          context.go(Routes.login);
        }
        return;
      }

      appLogger.info('[AuthCallbackPage] 🔐 トークンとユーザー情報を処理中...');

      // ユーザー情報をパース（JSON形式）
      dynamic userInfo;
      try {
        userInfo = jsonDecode(widget.user!);
        appLogger.info('[AuthCallbackPage] ✅ ユーザー情報を取得: ${userInfo['email']}');
      } catch (e) {
        appLogger.error('[AuthCallbackPage] ⛔ ユーザー情報のパース失敗', e);
        if (mounted) {
          context.go(Routes.login);
        }
        return;
      }

      // Riverpod の制限を回避するため、プロバイダ変更を遅延させる
      await Future(() async {
        // トークンとユーザー情報を保存して認証完了
        final notifier = ref.read(authProvider.notifier);
        await notifier.saveTokenAndSetUser(userInfo, widget.token!);
      });

      appLogger.info('[AuthCallbackPage] 🎉 認証完了、ホーム画面に遷移');
      
      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) context.go(Routes.home);
      }
    } catch (e) {
      appLogger.error('[AuthCallbackPage] ⛔ ディープリンク処理エラー', e);
      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) context.go(Routes.login);
      }
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 24),
            FutureBuilder<void>(
              future: _authFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Text('認証を処理中です...');
                } else if (snapshot.hasError) {
                  return Column(
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('認証エラー: ${snapshot.error}'),
                    ],
                  );
                } else {
                  return const Text('認証完了');
                }
              },
            ),
          ],
        ),
      ),
    );
}