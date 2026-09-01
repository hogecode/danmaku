import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:mobile/presentation/notifiers/player_notifier.dart';
import 'dart:async';

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
  Timer? _updateTimer;
  bool _isInitialized = false;
  
  /// 公開: DanmakuCanvas から currentTime を取得するため
  VideoPlayerController get controller => _controller;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
    
    // Timer を開始（定期的に currentTime を更新）
    _updateTimer = Timer.periodic(const Duration(milliseconds: 16), (_) {
      _safeUpdatePlayerState();
    });
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
          
          // プレイヤー状態をplayerStateProviderを利用して更新
          // presentaions/notifiers/player_notifier.dart の PlayerNotifier を利用して状態を更新
          final notifier = ref.read(playerStateProvider.notifier);
          notifier.updateDuration(_controller.value.duration);
          
          // ビデオを自動再生
          _controller.play();
          notifier.updatePlayingState(true);
        }
      }).catchError((error) {
        if (mounted) {
          widget.onError?.call();
          ref.read(playerStateProvider.notifier).setError(error.toString());
        }
      });
  }

  /// プレイヤー状態を定期的に更新
  void _updatePlayerState() {
    // ✅ mounted チェック（dispose 後のアクセス防止）
    if (!mounted) return;
    
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

  /// プレイヤー状態を安全に更新（dispose 後のエラーを無視）
  void _safeUpdatePlayerState() {
    try {
      if (!mounted) return;
      
      if (_controller.value.isInitialized) {
        ref.read(playerStateProvider.notifier)
            .updateCurrentTime(_controller.value.position);
      }
    } catch (e) {
      // dispose 後のエラーを無視
      debugPrint('⚠️ Safely ignored error in _updatePlayerState: $e');
    }
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
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

// 以下のメソッドを追加して、ビデオの再生、一時停止、シーク、再生速度、音量を制御する
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
