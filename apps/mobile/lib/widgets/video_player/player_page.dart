import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/widgets/video_player/video_view.dart';
import 'package:mobile/widgets/video_player/controller_bar.dart';
import 'package:mobile/widgets/video_player/danmaku/danmaku_canvas.dart';
import 'package:mobile/widgets/video_player/danmaku/danmaku_particle.dart';
import 'package:mobile/widgets/video_player/settings/settings_panel.dart';
import 'package:mobile/widgets/video_player/models/player_entity.dart';
import 'package:mobile/providers/video_player_provider.dart';

class VideoPlayerPage extends ConsumerStatefulWidget {
  final String videoUrl;
  final String? fileName;
  final List<dynamic>? danmakuList;

  const VideoPlayerPage({
    Key? key,
    required this.videoUrl,
    this.fileName,
    this.danmakuList,
  }) : super(key: key);

  @override
  ConsumerState<VideoPlayerPage> createState() => _VideoPlayerPageState();
}


class _VideoPlayerPageState extends ConsumerState<VideoPlayerPage> {
  // ビデオプレイヤーの状態を管理するためのキーとプレイヤー状態
  late GlobalKey<VideoViewState> _videoViewKey;
  late PlayerEntity _playerState;

  @override
  void initState() {
    super.initState();
    _videoViewKey = GlobalKey<VideoViewState>();
    _playerState = const PlayerEntity();
  }

  void _updatePlayerState({
    Duration? currentTime,
    Duration? duration,
    bool? isPlaying,
    double? playbackSpeed,
    bool? isFullscreen,
    bool? isLoading,
    String? errorMessage,
  }) {
    if (!mounted) return;
    setState(() {
      _playerState = _playerState.copyWith(
        currentTime: currentTime,
        duration: duration,
        isPlaying: isPlaying,
        playbackSpeed: playbackSpeed,
        isFullscreen: isFullscreen,
        isLoading: isLoading,
        errorMessage: errorMessage,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final uiState = ref.watch(playerUIStateProvider);
    final danmakuSettings = ref.watch(danmakuSettingsProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Column(children: [
              Expanded(
                child: Stack(children: [
                  _buildVideoView(),
                  if (danmakuSettings.isVisible) _buildDanmakuLayer(),
                  if (uiState.controllerVisible) _buildControllerBar(),
                ]),
              ),
            ]),
            if (uiState.settingsPanelVisible) _buildSettingsPanel(),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoView() => VideoView(
    key: _videoViewKey,
    videoUrl: widget.videoUrl,
    onReady: () => debugPrint('✅ Video ready'),
    onError: () => _showError(),
    onCurrentTimeChanged: (d) => _updatePlayerState(currentTime: d),
    onPlayingStateChanged: (p) => _updatePlayerState(isPlaying: p),
  );

  void _showError() {
    _updatePlayerState(errorMessage: 'ビデオの再生に失敗しました');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ビデオの再生に失敗しました')),
    );
  }

  Widget _buildDanmakuLayer() => Positioned(
    top: 0, left: 0, right: 0, bottom: 0,
    child: IgnorePointer(
      child: DanmakuCanvas(
        currentTime: _playerState.currentTime.inMilliseconds / 1000.0,
        globalOpacity: ref.watch(danmakuSettingsProvider).opacity,
        globalSpeedRate: ref.watch(danmakuSettingsProvider).speedRate,
        isPaused: !_playerState.isPlaying,
        danmakuList: (widget.danmakuList ?? []).cast<DanmakuEntity>(),
      ),
    ),
  );

  Widget _buildControllerBar() => Positioned(
    bottom: 0, left: 0, right: 0,
    child: SafeArea(
      child: ControllerBar(
        isPlaying: _playerState.isPlaying,
        currentTime: _playerState.currentTime,
        duration: _playerState.duration,
        playbackSpeed: _playerState.playbackSpeed,
        isFullscreen: _playerState.isFullscreen,
        onPlayTapped: () {
          _videoViewKey.currentState?.play();
          _updatePlayerState(isPlaying: true);
        },
        onPauseTapped: () {
          _videoViewKey.currentState?.pause();
          _updatePlayerState(isPlaying: false);
        },
        onSeek: (pos) => _videoViewKey.currentState?.seek(pos),
        onSpeedChange: (speed) => _videoViewKey.currentState?.setPlaybackSpeed(speed),
        onSettingsTapped: () => ref.read(playerUIStateProvider.notifier).toggleSettingsPanel(),
        onFullscreenTapped: () => _updatePlayerState(isFullscreen: !_playerState.isFullscreen),
      ),
    ),
  );

  Widget _buildSettingsPanel() => Positioned(
    bottom: 0, left: 0, right: 0,
    child: SafeArea(
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.75),
        child: Stack(children: [
          const SettingsPanel(),
          Positioned(
            top: 8, right: 8,
            child: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => ref.read(playerUIStateProvider.notifier).toggleSettingsPanel(),
            ),
          ),
        ]),
      ),
    ),
  );
}
