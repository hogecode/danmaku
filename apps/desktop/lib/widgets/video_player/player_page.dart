import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:desktop/core/logger/app_logger.dart';
import 'package:desktop/widgets/video_player/video_view.dart';
import 'package:desktop/widgets/video_player/controller_bar.dart';
import 'package:desktop/widgets/video_player/danmaku/danmaku_canvas.dart';
import 'package:desktop/widgets/video_player/danmaku/danmaku_particle.dart';
import 'package:desktop/widgets/video_player/settings/settings_panel.dart';
import 'package:desktop/models/player_entity.dart';
import 'package:desktop/providers/video_player_provider.dart';
import 'package:desktop/services/video_service.dart';
import 'package:desktop/data/client/lib/api.dart';

class VideoPlayerPage extends ConsumerStatefulWidget {
  final String videoUrl;
  final String videoFileId;  // GDrive ファイル ID
  final String folderId;  // コメント取得用フォルダ ID
  final String? fileName;
  final List<dynamic>? danmakuList;

  const VideoPlayerPage({
    super.key,
    required this.videoUrl,
    required this.videoFileId,
    required this.folderId,
    this.fileName,
    this.danmakuList,
  });

  @override
  ConsumerState<VideoPlayerPage> createState() => _VideoPlayerPageState();
}


class _VideoPlayerPageState extends ConsumerState<VideoPlayerPage> {
  // ビデオプレイヤーの状態を管理するためのキー
  late GlobalKey<VideoViewState> _videoViewKey;
  // プレイヤーの状態を管理
  late PlayerEntity _playerState;
  // コメント取得用
  late Future<List<DPlayerCommentDto>> _commentsFuture;

  @override
  void initState() {
    super.initState();
    _videoViewKey = GlobalKey<VideoViewState>();
    _playerState = const PlayerEntity();
    // VideoService を直接呼び出してコメントを取得
    _commentsFuture = VideoService().getVideoComments(
      videoFileId: widget.videoFileId,
      folderId: widget.folderId,
    );
  }

  // プレイヤー状態を更新する関数
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
    // プレイヤーUI状態
    final uiState = ref.watch(playerUIStateProvider);
    // ダンマク設定
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

  // ビデオ表示ウィジェットを構築
  Widget _buildVideoView() => VideoView(
    key: _videoViewKey,
    videoUrl: widget.videoUrl,
    onReady: () => appLogger.debug('✅ Video ready'),
    onError: () {
      appLogger.error('❌ Video error');
      _showError();
    },
    onCurrentTimeChanged: (d) => _updatePlayerState(currentTime: d),
    onPlayingStateChanged: (p) => _updatePlayerState(isPlaying: p),
    onDurationChanged: (d) => _updatePlayerState(duration: d),
  );

  void _showError() {
    _updatePlayerState(errorMessage: 'ビデオの再生に失敗しました');
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ビデオの再生に失敗しました')),
    );
  }

  // TODO: この関数を呼び出す
  void _enterPip() {
    try {
      appLogger.debug('🎬 PIP mode requested');
      _showPipWindow();
    } catch (e) {
      appLogger.error('❌ PIP error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PIP起動に失敗しました: $e')),
        );
      }
    }
  }

  void _showPipWindow() => showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: Colors.transparent,
    transitionDuration: const Duration(milliseconds: 300),
    pageBuilder: (
      BuildContext buildContext,
      Animation<double> animation,
      Animation<double> secondaryAnimation,
    ) => Align(
      alignment: Alignment.bottomRight,
      child: Container(
        width: 200,
        height: 120,
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.white, width: 1),
          borderRadius: BorderRadius.circular(8),
          color: Colors.black,
        ),
        child: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Stack(
            children: [
              Container(
                color: Colors.black,
                child: const Center(
                  child: Text(
                    '📺 小窓再生\n（タップで戻る）',
                    style: TextStyle(color: Colors.white, fontSize: 12),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
    transitionBuilder: (
      BuildContext context,
      Animation<double> animation,
      Animation<double> secondaryAnimation,
      Widget child,
    ) => ScaleTransition(
      scale: animation,
      alignment: Alignment.bottomRight,
      child: child,
    ),
  );

  /// ✅ コメント取得して DanmakuCanvas に渡す
  /// ビデオビューの領域内のみに弾幕を表示
  Widget _buildDanmakuLayer() {
    // ビデオビューのRenderBoxを取得してサイズを計算
    final RenderBox? videoRenderBox = _videoViewKey.currentContext?.findRenderObject() as RenderBox?;
    final double videoHeight = videoRenderBox?.size.height ?? 0;

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SizedBox(
        height: videoHeight,  // ビデオの高さと同じに制限
        child: IgnorePointer(
          child: FutureBuilder<List<DPlayerCommentDto>>(
          future: _commentsFuture,
          builder: (context, snapshot) {
          // ⏳ コメント取得中
          if (snapshot.connectionState == ConnectionState.waiting) {
            return DanmakuCanvas(
              currentTime: _playerState.currentTime.inMilliseconds / 1000.0,
              globalOpacity: ref.watch(danmakuSettingsProvider).opacity,
              globalSpeedRate: ref.watch(danmakuSettingsProvider).speedRate,
              isPaused: !_playerState.isPlaying,
              danmakuList: [], // 空配列で待機
            );
          }
          
          // ❌ エラー時
          if (snapshot.hasError) {
            appLogger.warning('❌ Comments loading error: ${snapshot.error}');
            return DanmakuCanvas(
              currentTime: _playerState.currentTime.inMilliseconds / 1000.0,
              globalOpacity: ref.watch(danmakuSettingsProvider).opacity,
              globalSpeedRate: ref.watch(danmakuSettingsProvider).speedRate,
              isPaused: !_playerState.isPlaying,
              danmakuList: [], // エラーは無視して空配列
            );
          }
          
          // ✅ データ取得成功
          final comments = snapshot.data ?? [];
          
          // DPlayerCommentDto を DanmakuEntity に変換
          final danmakuEntities = comments.map((comment) {
            // type: "normal" → DanmakuType('right')
            // type: "top" → DanmakuType('top')
            // type: "bottom" → DanmakuType('bottom')
            final typeMapping = {
              'normal': 'right',
              'top': 'top',
              'bottom': 'bottom',
              'ue': 'top',
              'shita': 'bottom',
            };
            final danmakuType = typeMapping[comment.type] ?? 'right';
            
            // size: "big" → fontSize 20
            // size: "small" → fontSize 12
            // size: "normal" → fontSize 16
            final sizeMapping = {
              'big': 20.0,
              'small': 12.0,
              'normal': 16.0,
            };
            final fontSize = sizeMapping[comment.size] ?? 16.0;
            
            // color: "#ffffff" → Color
            final colorHex = comment.color.replaceFirst('#', '');
            final color = Color(int.parse('FF$colorHex', radix: 16));
            
            return DanmakuEntity(
              text: comment.text.isNotEmpty ? comment.text : '（空白コメント）',
              time: (comment.time as num).toDouble(),
              type: DanmakuType(danmakuType),
              size: DanmakuSize(fontSize: fontSize),
              color: color,
              author: comment.author,
            );
          }).toList();

          // DanmakuCanvasウィジェットを表示
          return DanmakuCanvas(
            currentTime: _playerState.currentTime.inMilliseconds / 1000.0,
            globalOpacity: ref.watch(danmakuSettingsProvider).opacity,
            globalSpeedRate: ref.watch(danmakuSettingsProvider).speedRate,
            isPaused: !_playerState.isPlaying,
            danmakuList: danmakuEntities,
          );
        },
      ),
    ),
        ),
      );
  }

  // コントローラーバーを構築
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
        onSpeedChange: (speed) {
          _videoViewKey.currentState?.setPlaybackSpeed(speed);
          _updatePlayerState(playbackSpeed: speed);
        },
        onSettingsTapped: () => ref.read(playerUIStateProvider.notifier).toggleSettingsPanel(),
        onFullscreenTapped: () => _updatePlayerState(isFullscreen: !_playerState.isFullscreen),
      ),
    ),
  );

  // 設定パネルを構築
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
