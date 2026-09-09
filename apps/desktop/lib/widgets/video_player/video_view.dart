import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:desktop/core/logger/app_logger.dart';

/// ビデオ表示ウィジェット
class VideoView extends ConsumerStatefulWidget {
  final String videoUrl;
  final VoidCallback? onReady;
  final VoidCallback? onError;
  final Function(Duration)? onCurrentTimeChanged;
  final Function(bool)? onPlayingStateChanged;
  final Function(Duration)? onDurationChanged;

  const VideoView({
    Key? key,
    required this.videoUrl,
    this.onReady,
    this.onError,
    this.onCurrentTimeChanged,
    this.onPlayingStateChanged,
    this.onDurationChanged,
  }) : super(key: key);

  @override
  ConsumerState<VideoView> createState() => VideoViewState();
}


class VideoViewState extends ConsumerState<VideoView> {
  late VideoPlayerController _controller;
  // プレイヤー状態を定期的に更新するタイマー
  Timer? _updateTimer;
  bool _isInitialized = false;

  /// 公開: VideoView のコントローラーを取得
  VideoPlayerController get controller => _controller;

  @override
  void initState() {
    super.initState();
    // 初期化をフレーム後に実行
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeVideo();
    });

   // プレイヤー状態を定期的に更新
    _updateTimer = Timer.periodic(const Duration(milliseconds: 100), (_) {
      _safeUpdatePlayerState();
    });
  }

  /// ビデオコントローラーを初期化
  /// 
  /// 注記: URL には既に ?token=xxx が含まれているため、
  /// 追加の Authorization ヘッダーは不要
  Future<void> _initializeVideo() async {
    appLogger.debug('🎬 Initializing video with URL: ${widget.videoUrl}');



    appLogger.debug('📤 Sending request to: ${widget.videoUrl}');

    _controller = VideoPlayerController.networkUrl(
      Uri.parse(widget.videoUrl),
    )
      ..initialize().then((_) {
        if (mounted) {
          setState(() {
            _isInitialized = true;
          });
          appLogger.debug('✅ Video initialized successfully');
          appLogger.debug('📊 Video duration: ${_controller.value.duration}');
          appLogger.debug('📊 Video size: ${_controller.value.size}');
          
          // duration をコールバックで通知
          widget.onDurationChanged?.call(_controller.value.duration);
          widget.onReady?.call();

          // ビデオを自動再生
          _controller.play();
          widget.onPlayingStateChanged?.call(true);
        }
      }).catchError((error) {
        if (mounted) {
          widget.onError?.call();
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
      appLogger.warning('⚠️ Error in _safeUpdatePlayerState: $e');
    }
  }

  @override
  void didUpdateWidget(VideoView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl) {
      _controller.pause();
      _controller.dispose();
      _isInitialized = false;
      // async 処理として実行（await しない）
      _initializeVideo().then((_) {
        // 初期化完了
      }).catchError((e) {
        appLogger.warning('⚠️ Error in didUpdateWidget: $e');
      });
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
        if (_controller.value.isPlaying) {
          pause();
        } else {
          play();
        }
      },
      child: Container(
        color: Colors.black,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: Center(
                child: AspectRatio(
                  aspectRatio: _controller.value.aspectRatio,
                  child: VideoPlayer(_controller),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
