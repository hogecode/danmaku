import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'dart:async';

/// ビデオ表示ウィジェット
class VideoView extends ConsumerStatefulWidget {
  final String videoUrl;
  final VoidCallback? onReady;
  final VoidCallback? onError;
  final Function(Duration)? onCurrentTimeChanged;
  final Function(bool)? onPlayingStateChanged;

  const VideoView({
    Key? key,
    required this.videoUrl,
    this.onReady,
    this.onError,
    this.onCurrentTimeChanged,
    this.onPlayingStateChanged,
  }) : super(key: key);

  @override
  ConsumerState<VideoView> createState() => VideoViewState();
}

class VideoViewState extends ConsumerState<VideoView> {
  late VideoPlayerController _controller;
  Timer? _updateTimer;
  bool _isInitialized = false;

  /// 公開: VideoView のコントローラーを取得
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

          // ビデオを自動再生
          _controller.play();
          widget.onPlayingStateChanged?.call(true);
        }
      }).catchError((error) {
        if (mounted) {
          widget.onError?.call();
          debugPrint('❌ Video initialization error: $error');
        }
      });
  }

  /// プレイヤー状態を安全に更新（dispose 後のエラーを無視）
  void _safeUpdatePlayerState() {
    try {
      if (!mounted) return;

      if (_controller.value.isInitialized) {
        widget.onCurrentTimeChanged?.call(_controller.value.position);

        // 再生状態の変更を通知
        final isPlaying = _controller.value.isPlaying;
        widget.onPlayingStateChanged?.call(isPlaying);
      }
    } catch (e) {
      debugPrint('⚠️ Error in _safeUpdatePlayerState: $e');
    }
  }

  @override
  void didUpdateWidget(VideoView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl) {
      _controller.pause();
      _controller.dispose();
      _isInitialized = false;
      _initializeVideo();
    }
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  // ========== 公開メソッド ==========

  /// ビデオを再生
  void play() {
    _controller.play();
    widget.onPlayingStateChanged?.call(true);
  }

  /// ビデオを一時停止
  void pause() {
    _controller.pause();
    widget.onPlayingStateChanged?.call(false);
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

  @override
  Widget build(BuildContext context) {
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

    return GestureDetector(
      onTap: () {
        // タップでビデオの再生/一時停止
        if (_controller.value.isPlaying) {
          pause();
        } else {
          play();
        }
      },
      child: Container(
        color: Colors.black,
        child: VideoPlayer(_controller),
      ),
    );
  }
}
