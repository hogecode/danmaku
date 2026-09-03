import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/presentation/widgets/video_view/video_view.dart';
import 'package:mobile/presentation/widgets/controller_bar/controller_bar.dart';
import 'package:mobile/presentation/widgets/danmaku/danmaku_canvas.dart';
import 'package:mobile/presentation/widgets/settings/settings_panel.dart';
import 'package:mobile/presentation/notifiers/player_notifier.dart';
import 'package:mobile/presentation/notifiers/danmaku_notifier.dart';
import 'package:mobile/presentation/providers/app_provider.dart';
import 'package:mobile/presentation/providers/ui_provider.dart';
import 'package:mobile/domain/entities/player_entity.dart';

class PlayerPage
    extends ConsumerStatefulWidget {
  final String videoId;
  final String? fileName;

  const PlayerPage({
    Key? key,
    required this.videoId,
    this.fileName,
  }) : super(key: key);

  @override
  ConsumerState<PlayerPage>
      createState() =>
          _PlayerPageState();
}


class _PlayerPageState extends ConsumerState<PlayerPage> {
  late GlobalKey<VideoViewState> _videoViewKey;

  @override
  void initState() {
    super.initState();
    _videoViewKey = GlobalKey<VideoViewState>();
    
    // レンダリング後に弾幕を取得すめE
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchDanmaku();
    });
  }

  void _fetchDanmaku() {
    debugPrint('=== Fetching danmaku for videoId: ${widget.videoId} ===');
    final fetchUseCase = ref.read(fetchDanmakuUseCaseProvider);
    final notifier = ref.read(
      danmakuStateProvider(fetchUseCase).notifier,
    );
    notifier.fetchDanmaku(widget.videoId);
  }

  @override
  Widget build(BuildContext context) {
    final playerState = ref.watch(playerStateProvider);
    final controllerVisible = ref.watch(controllerVisibleProvider);
    final settingsPanelVisible = ref.watch(settingsPanelVisibleProvider);

    final danmakuOpacity = ref.watch(danmakuOpacityProvider);
    final danmakuSpeedRate = ref.watch(danmakuSpeedRateProvider);
    final danmakuVisible = ref.watch(danmakuVisibilityProvider);
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                Expanded(
                  child: Stack(
                    children: [
                      _buildVideoView(),
                      if (danmakuVisible) _buildDanmakuLayer(danmakuOpacity, danmakuSpeedRate, playerState),
                      if (playerState.isLoading) _buildLoadingOverlay(),
                      if (controllerVisible) _buildControllerBar(),
                    ],
                  ),
                ),
              ],
            ),
            if (settingsPanelVisible) _buildSettingsPanel(),
          ],
        ),
      ),
    );
  }

/// ビデオビューを構築
  Widget _buildVideoView() {
    return VideoView(
      key: _videoViewKey,
      videoUrl:
          'http://100.72.160.115:8000/api/v1/files/6/mono02.mp4',
      onReady: () =>
          debugPrint('Video ready'),
      onError: () {
        ScaffoldMessenger.of(
                context)
            .showSnackBar(
          const SnackBar(
              content: Text(
                  'ビデオの再生に失敗しました')),
        );
      },
    );
  }

/// ダンマクレイヤーを構篁E
  Widget _buildDanmakuLayer(double opacity, double speedRate, PlayerEntity playerState) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      child: IgnorePointer(
        child: DanmakuCanvas(
          currentTime: playerState.currentTime.inMilliseconds / 1000.0,
          globalOpacity: opacity,
          globalSpeedRate: speedRate,
           isPaused: playerState.isPaused,
        ),
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    return const Center(
      child: SizedBox(
        width: 40,
        height: 40,
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
        ),
      ),
    );
  }

  Widget _buildControllerBar() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: SafeArea(
        child: ControllerBar(
          onPlayTapped: () {
            _videoViewKey.currentState?.play();
            ref.read(playerStateProvider.notifier).updatePlayingState(true);
          },
          onPauseTapped: () {
            _videoViewKey.currentState?.pause();
            ref.read(playerStateProvider.notifier).updatePlayingState(false);
          },
          onSeek: (position) {
            _videoViewKey.currentState?.seek(position);
          },
          onSpeedChange: (speed) {
            _videoViewKey.currentState?.setPlaybackSpeed(speed);
            ref.read(playerStateProvider.notifier).updatePlaybackSpeed(speed);
          },
          onSettingsTapped: () {
            ref.read(settingsPanelVisibleProvider.notifier).state = true;
          },
          onFullscreenTapped: () {
            final current = ref.read(playerStateProvider);
            ref.read(playerStateProvider.notifier).updateFullscreen(!current.isFullscreen);
          },
        ),
      ),
    );
  }

  Widget _buildSettingsPanel() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.75,
          ),
          child: Stack(
            children: [
              const SettingsPanel(),
              Positioned(
                top: 8,
                right: 8,
                child: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    ref.read(settingsPanelVisibleProvider.notifier).state = false;
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
