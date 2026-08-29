import 'package:flutter_app/data/repositories/danmaku_repository.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';

/// ダンマク取得 UseCase
class FetchDanmakuUseCase {
  final DanmakuRepository _repository;

  FetchDanmakuUseCase(this._repository);

  /// ダンマクを取得
  ///
  /// [videoId] ビデオID
  /// 戻り値: ダンマクエンティティのリスト
  Future<List<DanmakuEntity>> execute(String videoId) {
    return _repository.getDanmaku(videoId);
  }
}
