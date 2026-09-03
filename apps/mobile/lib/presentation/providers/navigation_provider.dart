import 'package:flutter_riverpod/flutter_riverpod.dart';

// ============================================================================
// Navigation Providers
// ============================================================================

/// 現在のフォルダ ID プロバイダー
final currentFolderIdProvider = StateProvider<String>((ref) => 'root');

/// 現在のフォルダ名プロバイダー
final currentFolderNameProvider = StateProvider<String>((ref) => 'My Drive');

/// フォルダ階層履歴プロバイダー（id と name のペア）
final folderHistoryProvider =
    StateProvider<List<({String id, String name})>>((ref) => []);

/// 検索クエリプロバイダー
final searchQueryProvider = StateProvider<String>((ref) => '');

/// 検索結果表示中フラグ
final isSearchingProvider = StateProvider<bool>((ref) => false);
