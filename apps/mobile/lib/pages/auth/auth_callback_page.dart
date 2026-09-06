import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/auth_notifier.dart';

final _logger = Logger();

class AuthCallbackPage extends ConsumerStatefulWidget {
  final String code;
  final String state;
  final String? user; // Base64-encoded user info

  const AuthCallbackPage({
    Key? key,
    required this.code,
    required this.state,
    this.user,
  }) : super(key: key);

  @override
  ConsumerState<AuthCallbackPage> createState() => _AuthCallbackPageState();
}

class _AuthCallbackPageState extends ConsumerState<AuthCallbackPage> {
  late Future<void> _authFuture;

  @override
  void initState() {
    super.initState();
    _logger.i('[AuthCallbackPage] OAuth callback started');
    _logger.i('[AuthCallbackPage] user provided: \${widget.user != null}');
    _authFuture = _completeOAuth();
  }

  Future<void> _completeOAuth() async {
    try {
      _logger.i('[AuthCallbackPage] Confirming OAuth completion');
      final notifier = ref.read(authProvider.notifier);
      
      // If user info provided via deep link, use it directly
      if (widget.user != null && widget.user!.isNotEmpty) {
        try {
          final userDataJson = utf8.decode(base64Url.decode(widget.user!));
          final userInfo = jsonDecode(userDataJson);
          _logger.i('[AuthCallbackPage] User info from deep link');
          
          // Set user info directly without server call
          await notifier.setUserInfo(userInfo);
          
          if (mounted) {
            _logger.i('[AuthCallbackPage] OAuth complete');
            await Future.delayed(const Duration(milliseconds: 500));
            if (mounted) context.go('/');
          }
          return;
        } catch (e) {
          _logger.w('[AuthCallbackPage] Failed to decode user info', error: e);
        }
      }
      
      // Fallback: get user info from server
      final isComplete = await notifier.completeOAuth();

      if (isComplete && mounted) {
        _logger.i('[AuthCallbackPage] OAuth complete');
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) context.go('/');
      } else if (mounted) {
        _logger.e('[AuthCallbackPage] OAuth confirmation failed');
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) context.go('/login');
      }
    } catch (e) {
      _logger.e('[AuthCallbackPage] OAuth error', error: e);
      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                  return const Text('Completing authentication...');
                } else if (snapshot.hasError) {
                  return Column(
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 16),
                      Text('Auth error: \${snapshot.error}'),
                    ],
                  );
                } else {
                  return const Text('Authentication complete');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}