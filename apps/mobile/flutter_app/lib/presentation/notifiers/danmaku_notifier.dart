import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/domain/entities/danmaku_entity.dart';
import 'package:flutter_app/domain/usecases/fetch_danmaku_usecase.dart';
import 'package:logger/logger.dart';

/// ダンマク状態
class DanmakuState {
  final List<DanmakuEntity> danmakuList;
  final bool isLoading;
  final String? errorMessage;
  final double opacity;      // 0.0 ~ 1.0
  final double speedRate;     // 1.0 ~ 3.0
  final bool isVisible;

  const DanmakuState({
    this.danmakuList = const [],
    this.isLoading = false,
    this.errorMessage,
    this.opacity = 1.0,
    this.speedRate = 1.0,
    this.isVisible = true,
  });

  /// コピー（フィールド更新）
  DanmakuState copyWith({
    List<DanmakuEntity>? danmakuList,
    bool? isLoading,
    String? errorMessage,
    double? opacity,
    double? speedRate,
    bool? isVisible,
  }) =>
      DanmakuState(
        danmakuList: danmakuList ?? this.danmakuList,
        isLoading: isLoading ?? this.isLoading,
        errorMessage: errorMessage ?? this.errorMessage,
        opacity: opacity ?? this.opacity,
        speedRate: speedRate ?? this.speedRate,
        isVisible: isVisible ?? this.isVisible,
      );

  /// ローディング状態を生成
  factory DanmakuState.loading() => const DanmakuState(isLoading: true);

  /// エラー状態を生成
  factory DanmakuState.error(String msg) =>
      DanmakuState(errorMessage: msg);

  /// 成功状態を生成
  factory DanmakuState.success(List<DanmakuEntity> list) =>
      DanmakuState(danmakuList: list);

  @override
  String toString() =>
      'DanmakuState(count: ${danmakuList.length}, isLoading: $isLoading, opacity: $opacity, speedRate: $speedRate)';
}

/// ダンマク状態を管理するNotifier
class DanmakuNotifier extends StateNotifier<DanmakuState> {
  final FetchDanmakuUseCase _fetchDanmakuUseCase;
  late final Logger _logger;

  DanmakuNotifier(this._fetchDanmakuUseCase)
      : super(const DanmakuState()) {
    _logger = Logger();
  }

  /// ダンマクを取得
  Future<void> fetchDanmaku(String videoId) async {
    try {
      state = DanmakuState.loading();
      final danmakuList = await _fetchDanmakuUseCase.execute(videoId);
      state = DanmakuState.success(danmakuList);
      _logger.i('Fetched ${danmakuList.length} danmaku items');
    } catch (e) {
      final errorMsg = 'Failed to fetch danmaku: $e';
      state = DanmakuState.error(errorMsg);
      _logger.e(errorMsg);
    }
  }

  /// 不透明度を更新
  void updateOpacity(double opacity) {
    state = state.copyWith(
      opacity: opacity.clamp(0.0, 1.0),
    );
  }

  /// 速度倍率を更新
  void updateSpeedRate(double speedRate) {
    state = state.copyWith(
      speedRate: speedRate.clamp(0.5, 3.0),
    );
  }

  /// 表示/非表示を切り替え
  void toggleVisibility() {
    state = state.copyWith(isVisible: !state.isVisible);
  }

  /// 表示状態を設定
  void setVisible(bool visible) {
    state = state.copyWith(isVisible: visible);
  }

  /// ダンマクをクリア
  void clearDanmaku() {
    state = state.copyWith(danmakuList: []);
  }

  /// 状態をリセット
  void reset() {
    state = const DanmakuState();
  }
}

/// ダンマクStateNotifierプロバイダー
final danmakuStateProvider = StateNotifierProvider.family<
    DanmakuNotifier,
    DanmakuState,
    FetchDanmakuUseCase>((ref, fetchUseCase) {
  return DanmakuNotifier(fetchUseCase);
});
