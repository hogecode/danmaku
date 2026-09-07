import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/widgets/video_player/player_page.dart';

class PlayerPage extends ConsumerWidget {
  final String videoId;
  final String? fileName;

  const PlayerPage({
    Key? key,
    required this.videoId,
    this.fileName,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ビデオURL（例）
    const videoUrl = 'http://100.72.160.115:8000/api/v1/files/6/mono02.mp4';

    return VideoPlayerPage(
      videoUrl: videoUrl,
      fileName: fileName,
    );
  }
}

