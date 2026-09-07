import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/providers/auth_notifier.dart';

/// Auth Service プロバイダー
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

/// Auth 状態 + アクション
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});
