import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:logger/logger.dart';
import 'package:mobile/providers/ui_provider.dart';

final _logger = Logger();

class PlayerPage extends ConsumerStatefulWidget {
  final String videoId;
  final String? fileName;

  const PlayerPage({
    Key? key,
    required this.videoId,
    this.fileName,
  }) : super(key: key);

  @override
  ConsumerState<PlayerPage> createState() => _PlayerPageState();
}

class _PlayerPageState extends ConsumerState<PlayerPage> {
  bool _isLoading = true;
  bool _isPlaying = false;
  double _currentPosition = 0;
  double _duration = 100;

  @override
  void initState() {
    super.initState();
    _logger.i('Player initialized');
    _initializePlayer();
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(darkModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.fileName ?? 'Video Player'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _buildContent(),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      child: Column(
        children: [
          Container(
            color: Colors.black,
            width: double.infinity,
            height: 250,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.play_circle_outline,
                      size: 80, color: Colors.white),
                  const SizedBox(height: 16),
                  Text('Video: ${widget.fileName ?? "Unknown"}',
                      style: const TextStyle(
                          color: Colors.white, fontSize: 16)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                SliderTheme(
                  data: SliderThemeData(
                    trackHeight: 4,
                    thumbShape: const RoundSliderThumbShape(
                      enabledThumbRadius: 8,
                    ),
                  ),
                  child: Slider(
                    value: _currentPosition,
                    max: _duration,
                    onChanged: (value) {
                      setState(() => _currentPosition = value);
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatDuration(
                            Duration(seconds: _currentPosition.toInt())),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      Text(
                        _formatDuration(
                            Duration(seconds: _duration.toInt())),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _togglePlayPause,
                  icon: Icon(
                      _isPlaying ? Icons.pause : Icons.play_arrow),
                  label: Text(_isPlaying ? 'Pause' : 'Play'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Future<void> _initializePlayer() async {
    try {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() {
          _isLoading = false;
          _duration = 300;
        });
      }
    } catch (e) {
      _logger.e('Init failed', error: e);
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _togglePlayPause() {
    setState(() => _isPlaying = !_isPlaying);
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes =
        twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds =
        twoDigits(duration.inSeconds.remainder(60));
    return "${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds";
  }
}
