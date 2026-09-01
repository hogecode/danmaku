import 'package:flutter/material.dart';
import 'package:flutter_app/core/constants/app_constants.dart';
import 'package:flutter_app/data/models/danmaku_model.dart';
import 'package:flutter_app/data/services/api_service.dart';
import 'package:flutter_app/data/services/storage_service.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';
import 'package:logger/logger.dart';

/// 弾幕コメント取得リポジトリ
// このリポジトリはサービス層に依存
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

  /// ダンマク取得
  Future<List<DanmakuEntity>> getDanmaku(String videoId) async {
    try {
      // API から取得を試みる
      final models = await _apiService.fetchDanmaku(videoId: videoId);

      // モデルをエンティティに変換
      return _modelsToEntities(models);
    } catch (e) {
      _logger.w('Failed to fetch danmaku from API, trying cache: $e');
      // キャッシュから取得を試みる、または空のリストを返す
      return [];
    }
  }

  /// danmakuModel をエンティティに変換
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
}
