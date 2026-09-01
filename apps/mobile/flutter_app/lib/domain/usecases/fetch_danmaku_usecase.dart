import 'package:flutter_app/data/repositories/danmaku_repository.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';

/// 弾幕取得 UseCase
class FetchDanmakuUseCase {
  final DanmakuRepository _repository;

  FetchDanmakuUseCase(this._repository);

  /// 弾幕をリポジトリ層を利用して取得
  // リポジトリ層はサービス層に依存している
  /// 戻り値: 弾幕エンティティのリスト
  Future<List<DanmakuEntity>> execute(String videoId) {
    return _repository.getDanmaku(videoId);
  }
}
