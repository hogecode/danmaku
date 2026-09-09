import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:desktop/core/constants/color_constants.dart';
import 'package:desktop/providers/video_player_provider.dart';

class SettingsPanel extends ConsumerStatefulWidget {
  final VoidCallback? onClose;

  const SettingsPanel({
    Key? key,
    this.onClose,
  }) : super(key: key);

  @override
  ConsumerState<SettingsPanel> createState() => _SettingsPanelState();
}

class _SettingsPanelState extends ConsumerState<SettingsPanel>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Container(
        color: ColorConstants.lightBackground,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TabBar(
              controller: _tabController,
              labelColor: ColorConstants.lightPrimary,
              unselectedLabelColor: Colors.grey,
              indicatorColor: ColorConstants.lightPrimary,
              tabs: const [
                Tab(text: '再生速度'),
                Tab(text: 'コメント設定'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildPlaybackTab(context),
                  _buildDanmakuTab(context),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 再生速度タブ
  Widget _buildPlaybackTab(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('再生速度'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
                .map((speed) => _SpeedButton(speed: speed))
                .toList(),
          ),
        ],
      ),
    );
  }

  /// コメント設定タブ
  Widget _buildDanmakuTab(BuildContext context) {
    final danmakuSettings = ref.watch(danmakuSettingsProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('コメント透明度'),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${(danmakuSettings.opacity * 100).toStringAsFixed(0)}%'),
              Expanded(
                child: Slider(
                  value: danmakuSettings.opacity,
                  onChanged: (value) {
                    ref
                        .read(danmakuSettingsProvider.notifier)
                        .updateOpacity(value);
                  },
                  min: 0.0,
                  max: 1.0,
                  divisions: 10,
                  activeColor: ColorConstants.lightPrimary,
                  inactiveColor: Colors.grey[300],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('コメント速度'),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${danmakuSettings.speedRate.toStringAsFixed(2)}x'),
              Expanded(
                child: Slider(
                  value: danmakuSettings.speedRate,
                  onChanged: (value) {
                    ref
                        .read(danmakuSettingsProvider.notifier)
                        .updateSpeedRate(value);
                  },
                  min: 0.25,
                  max: 2.0,
                  divisions: 7,
                  activeColor: ColorConstants.lightPrimary,
                  inactiveColor: Colors.grey[300],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSectionTitle('表示設定'),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('コメント表示'),
              Switch(
                value: danmakuSettings.isVisible,
                onChanged: (value) {
                  ref
                      .read(danmakuSettingsProvider.notifier)
                      .setVisibility(value);
                },
                activeColor: ColorConstants.lightPrimary,
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// セクションタイトル
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
      ),
    );
  }
}

/// 再生速度ボタン
class _SpeedButton extends ConsumerWidget {
  final double speed;

  const _SpeedButton({
    required this.speed,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // このボタンが実装されるメインページで速度管理されるので、ここでは表示のみ
    return OutlinedButton(
      onPressed: () {
        debugPrint('Speed: ${speed}x');
      },
      child: Text('${speed.toStringAsFixed(2)}x'),
    );
  }
}
