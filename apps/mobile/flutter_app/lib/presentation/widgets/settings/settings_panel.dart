import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/color_constants.dart';
import 'package:flutter_app/core/i18n/i18n.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/presentation/widgets/settings/danmaku_settings.dart';
import 'package:flutter_app/presentation/notifiers/player_notifier.dart';

class SettingsPanel extends ConsumerStatefulWidget {
  const SettingsPanel({Key? key}) : super(key: key);

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
    final localizations = AppLocalizations.of(context)!;
    final isDarkMode = ref.watch(darkModeProvider);
    final bgColor = isDarkMode
        ? ColorConstants.darkBackground
        : ColorConstants.lightBackground;
    final tabBgColor = isDarkMode
        ? ColorConstants.darkControllerBg
        : ColorConstants.lightControllerBg;

    return DefaultTabController(
      length: 2,
      child: Container(
        color: bgColor,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TabBar(
              controller: _tabController,
              labelColor: ColorConstants.lightPrimary,
              unselectedLabelColor: Colors.grey,
              indicatorColor: ColorConstants.lightPrimary,
              tabs: [
                Tab(text: localizations.playbackSpeed),
                Tab(text: localizations.danmakuSettings),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildPlaybackTab(context, localizations),
                  _buildDanmakuTab(context, localizations),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 再生速度タブ
  Widget _buildPlaybackTab(
    BuildContext context,
    AppLocalizations localizations,
  ) {
    final isDarkMode = ref.watch(darkModeProvider);
    final playerState = ref.watch(playerStateProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 再生速度セレクター
          _buildSectionTitle(localizations.playbackSpeed),
          const SizedBox(height: 12),
          _buildSpeedGrid(playerState.playbackSpeed),
          const SizedBox(height: 32),

          // ダークモード
          _buildSectionTitle(localizations.darkMode),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(isDarkMode ? localizations.darkMode : 'Light Mode'),
              Switch(
                value: isDarkMode,
                onChanged: (value) {
                  ref.read(darkModeProvider.notifier).state = value;
                },
                activeColor: ColorConstants.lightPrimary,
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// ダンマク設定タブ
  Widget _buildDanmakuTab(
    BuildContext context,
    AppLocalizations localizations,
  ) {
    return SingleChildScrollView(
      child: const DanmakuSettingsPanel(),
    );
  }

  /// 再生速度グリッド
  Widget _buildSpeedGrid(double currentSpeed) {
    const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      childAspectRatio: 1.5,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      children: speeds
          .map(
            (speed) => _SpeedButton(
              speed: speed,
              isSelected: speed == currentSpeed,
              onPressed: () {
                ref
                    .read(playerStateProvider.notifier)
                    .updatePlaybackSpeed(speed);
              },
            ),
          )
          .toList(),
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

/// 速度ボタン
class _SpeedButton extends StatelessWidget {
  final double speed;
  final bool isSelected;
  final VoidCallback onPressed;

  const _SpeedButton({
    required this.speed,
    required this.isSelected,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSelected
          ? ColorConstants.lightPrimary
          : Colors.grey[300],
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: Center(
          child: Text(
            '${speed.toStringAsFixed(2)}x',
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? Colors.white : Colors.black,
            ),
          ),
        ),
      ),
    );
  }
}
