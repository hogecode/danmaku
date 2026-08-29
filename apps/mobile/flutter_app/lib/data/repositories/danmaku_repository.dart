import 'package:flutter_app/core/constants/app_constants.dart';
import 'package:flutter_app/data/models/danmaku_model.dart';
import 'package:flutter_app/data/services/api_service.dart';
import 'package:flutter_app/data/services/storage_service.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';
import 'package:logger/logger.dart';

/// ダンマクリポジトリ
class DanmakuRepository {
  final ApiService _apiService;
  final StorageService _storageService;
  late final Logger _logger;

  DanmakuRepository({
    required ApiService apiService,
    required StorageService storageService,
  })  : _apiService = apiService,
        _storageService = storageService {
    _logger = Logger();
  }

  /// ダンマク取得（API優先、失敗時はキャッシュ）
  Future<List<DanmakuEntity>> getDanmaku(String videoId) async {
    try {
      // API から取得を試みる
      final models = await _apiService.fetchDanmaku(videoId: videoId);

      // キャッシュに保存
      _saveDanmakuCache(videoId, models);

      // モデルをエンティティに変換
      return _modelsToEntities(models);
    } catch (e) {
      _logger.w('Failed to fetch danmaku from API, trying cache: $e');

      // キャッシュから取得
      final cachedModels = _loadDanmakuCache(videoId);
      if (cachedModels.isNotEmpty) {
        _logger.i('Loaded danmaku from cache');
        return _modelsToEntities(cachedModels);
      }

      // キャッシュもない場合はエラー
      _logger.e('Failed to load danmaku from API and cache');
      rethrow;
    }
  }

  /// ダンマク送信（後実装）
  Future<void> sendDanmaku({
    required String videoId,
    required DanmakuEntity danmaku,
  }) async {
    try {
      await _apiService.sendDanmaku(
        videoId: videoId,
        time: danmaku.time,
        type: danmaku.type.value,
        color: _colorToHex(danmaku.color),
        text: danmaku.text,
        size: danmaku.size.value,
      );
      _logger.i('Danmaku sent successfully');
    } catch (e) {
      _logger.e('Failed to send danmaku', error: e);
      rethrow;
    }
  }

  /// Model をエンティティに変換
  List<DanmakuEntity> _modelsToEntities(List<DanmakuModel> models) {
    return models.map((model) {
      return DanmakuEntity(
        time: model.time,
        type: DanmakuType.fromString(model.type),
        color: _hexToColor(model.color),
        author: model.author,
        text: model.text,
        size: DanmakuSize.fromString(model.size),
        id: model.id,
      );
    }).toList();
  }

  /// HEX カラー文字列を Color に変換
  Color _hexToColor(String hexString) {
    try {
      // # を削除
      final hex = hexString.replaceFirst('#', '');

      // HEX 文字列が6文字でない場合はデフォルトカラーを返す
      if (hex.length != 6) {
        return const Color(0xFFFFEAEA); // デフォルトピンク
      }

      // HEX を 10 進数に変換
      return Color(int.parse('FF$hex', radix: 16));
    } catch (e) {
      _logger.w('Failed to parse color: $hexString, using default');
      return const Color(0xFFFFEAEA);
    }
  }

  /// Color を HEX 文字列に変換
  String _colorToHex(Color color) {
    return '#${color.value.toRadixString(16).substring(2).toUpperCase()}';
  }

  /// ダンマクをキャッシュに保存
  void _saveDanmakuCache(String videoId, List<DanmakuModel> models) {
    try {
      final key = '${AppConstants.danmakuCacheKey}_$videoId';
      final jsonList = models.map((m) => m.toJson()).toList();
      _storageService.save(key, jsonList);
      _logger.d('Saved danmaku cache for video: $videoId');
    } catch (e) {
      _logger.e('Failed to save danmaku cache', error: e);
    }
  }

  /// キャッシュからダンマクを読込
  List<DanmakuModel> _loadDanmakuCache(String videoId) {
    try {
      final key = '${AppConstants.danmakuCacheKey}_$videoId';
      final jsonList = _storageService.get<List>(key) ?? [];
      return jsonList
          .map((json) => DanmakuModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      _logger.e('Failed to load danmaku cache', error: e);
      return [];
    }
  }

  /// キャッシュを削除
  Future<void> clearCache(String videoId) async {
    try {
      final key = '${AppConstants.danmakuCacheKey}_$videoId';
      await _storageService.delete(key);
      _logger.i('Cleared cache for video: $videoId');
    } catch (e) {
      _logger.e('Failed to clear cache', error: e);
    }
  }
}

// Color 拡張用の import
import 'package:flutter/material.dart';
