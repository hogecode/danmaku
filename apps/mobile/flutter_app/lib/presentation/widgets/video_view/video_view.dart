import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:flutter_app/presentation/notifiers/player_notifier.dart';

/// ビデオ表示ウィジェット
class VideoView extends ConsumerStatefulWidget {
  final String videoUrl;
  final VoidCallback? onReady;
  final VoidCallback? onError;

  const VideoView({
    Key? key,
    required this.videoUrl,
    this.onReady,
    this.onError,
  }) : super(key: key);

  @override
  ConsumerState<VideoView> createState() => VideoViewState();
}

class VideoViewState extends ConsumerState<VideoView> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  /// ビデオコントローラーを初期化
  void _initializeVideo() {
    _controller = VideoPlayerController.networkUrl(
      Uri.parse(widget.videoUrl),
    )
      ..initialize().then((_) {
        if (mounted) {
          setState(() {
            _isInitialized = true;
          });
          widget.onReady?.call();
          
          // プレイヤー状態を更新
          final notifier = ref.read(playerStateProvider.notifier);
          notifier.updateDuration(_controller.value.duration);
        }
      }).catchError((error) {
        if (mounted) {
          widget.onError?.call();
          ref.read(playerStateProvider.notifier).setError(error.toString());
        }
      })
      ..addListener(_updatePlayerState);
  }

  /// プレイヤー状態を定期的に更新
  void _updatePlayerState() {
    if (_controller.value.isInitialized) {
      ref.read(playerStateProvider.notifier)
          .updateCurrentTime(_controller.value.position);
    }
  }

  @override
  void didUpdateWidget(VideoView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl) {
      _controller.pause();
      _controller.dispose();
      _initializeVideo();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final playerState = ref.watch(playerStateProvider);

    // ローディング中
    if (!_isInitialized) {
      return Container(
        color: Colors.black,
        child: const Center(
          child: SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
        ),
      );
    }

    // エラー表示
    if (playerState.errorMessage != null) {
      return Container(
        color: Colors.black,
        child: Center(
          child: Text(
            'エラー: ${playerState.errorMessage}',
            style: const TextStyle(color: Colors.white),
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: () {
        // タップでビデオの再生/一時停止
        if (_controller.value.isPlaying) {
          _controller.pause();
          ref.read(playerStateProvider.notifier).updatePlayingState(false);
        } else {
          _controller.play();
          ref.read(playerStateProvider.notifier).updatePlayingState(true);
        }
      },
      child: Container(
        color: Colors.black,
        child: VideoPlayer(_controller),
      ),
    );
  }

  /// ビデオを再生
  void play() {
    _controller.play();
    ref.read(playerStateProvider.notifier).updatePlayingState(true);
  }

  /// ビデオを一時停止
  void pause() {
    _controller.pause();
    ref.read(playerStateProvider.notifier).updatePlayingState(false);
  }

  /// シークを実行
  void seek(Duration position) {
    _controller.seekTo(position);
  }

  /// 再生速度を設定
  void setPlaybackSpeed(double speed) {
    _controller.setPlaybackSpeed(speed);
  }

  /// 音量を設定
  void setVolume(double volume) {
    _controller.setVolume(volume);
  }
}
