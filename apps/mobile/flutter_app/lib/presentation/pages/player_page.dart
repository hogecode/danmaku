import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/presentation/widgets/video_view/video_view.dart';
import 'package:flutter_app/presentation/widgets/controller_bar/controller_bar.dart';
import 'package:flutter_app/presentation/widgets/danmaku/danmaku_canvas.dart';
import 'package:flutter_app/presentation/notifiers/player_notifier.dart';
import 'package:flutter_app/presentation/notifiers/danmaku_notifier.dart';
import 'package:flutter_app/presentation/providers/app_provider.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';

/// プレイヤーページ
class PlayerPage extends ConsumerStatefulWidget {
  final String videoId;
  final String videoUrl;
  final String videoTitle;

  const PlayerPage({
    Key? key,
    required this.videoId,
    required this.videoUrl,
    required this.videoTitle,
  }) : super(key: key);

  @override
  ConsumerState<PlayerPage> createState() => _PlayerPageState();
}

class _PlayerPageState extends ConsumerState<PlayerPage> {
  late GlobalKey<VideoViewState> _videoViewKey;

  @override
  void initState() {
    super.initState();
    // videowidgetの状態を管理するためのGlobalKeyを初期化
    _videoViewKey = GlobalKey<VideoViewState>();
    
    // 画面の描画が1回終わったあとに、この処理を実行する
    // ダンマクを取得
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchDanmaku();
    });
  }

  /// ダンマクを取得
  void _fetchDanmaku() {
    final fetchUseCase = ref.read(fetchDanmakuUseCaseProvider);
    // presentation/notifiers/danmaku_notifier.dart の DanmakuNotifier を利用して状態を更新
    final notifier = ref.read(
      danmakuStateProvider(fetchUseCase).notifier,
    );
    notifier.fetchDanmaku(widget.videoId);
  }

  @override
  Widget build(BuildContext context) {
    // プレイヤー状態をplayer_notifierから取得
    final playerState = ref.watch(playerStateProvider);

    // ui_provider.dart から UI 状態を取得
    final controllerVisible = ref.watch(controllerVisibleProvider);
    final danmakuOpacity = ref.watch(danmakuOpacityProvider);
    final danmakuSpeedRate = ref.watch(danmakuSpeedRateProvider);
    final danmakuVisible = ref.watch(danmakuVisibilityProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // ビデオプレイヤー
            Expanded(
              child: Stack(
                children: [
                  // ビデオwidget
                  VideoView(
                    key: _videoViewKey,
                    videoUrl: widget.videoUrl,
                    onReady: () {
                      // ビデオ準備完了時の処理
                      debugPrint('Video ready');
                    },
                    onError: () {
                      // エラー時の処理
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('ビデオの再生に失敗しました')),
                      );
                    },
                  ),
                  
                  // ダンマク Canvas（ビデオの上に重ねる）
                  if (danmakuVisible)
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: IgnorePointer(
                        child: DanmakuCanvas(
                          currentTime: playerState.currentTime.inMilliseconds / 1000.0,
                          globalOpacity: danmakuOpacity,
                          globalSpeedRate: danmakuSpeedRate,
                        ),
                      ),
                    ),
                  
                  // ローディング表示
                  if (playerState.isLoading)
                    const Center(
                      child: SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    ),
                  
                  // コントローラーバー（下部）
                  if (controllerVisible)
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: SafeArea(
                        child: ControllerBar(
                          onPlayTapped: () {
                            _videoViewKey.currentState?.play();
                            ref
                                .read(playerStateProvider.notifier)
                                .updatePlayingState(true);
                          },
                          onPauseTapped: () {
                            _videoViewKey.currentState?.pause();
                            ref
                                .read(playerStateProvider.notifier)
                                .updatePlayingState(false);
                          },
                          onSeek: (position) {
                            _videoViewKey.currentState?.seek(position);
                          },
                          onSpeedChange: (speed) {
                            _videoViewKey.currentState?.setPlaybackSpeed(speed);
                            ref
                                .read(playerStateProvider.notifier)
                                .updatePlaybackSpeed(speed);
                          },
                          onSettingsTapped: () {
                            ref
                                .read(settingsPanelVisibleProvider.notifier)
                                .state = true;
                          },
                          onFullscreenTapped: () {
                            ref
                                .read(playerStateProvider.notifier)
                                .updateFullscreen(
                                  !playerState.isFullscreen,
                                );
                          },
                        ),
                      ),
                    )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
