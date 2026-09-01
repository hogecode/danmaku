import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/color_constants.dart';
import 'package:flutter_app/core/i18n/i18n.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/presentation/providers/app_provider.dart';

/// ダンマク設定スライダーウィジェット
class DanmakuSettingsPanel extends ConsumerWidget {
  const DanmakuSettingsPanel({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final opacity = ref.watch(danmakuOpacityProvider);
    final speedRate = ref.watch(danmakuSpeedRateProvider);
    final isVisible = ref.watch(danmakuVisibilityProvider);
    final isDarkMode = ref.watch(darkModeProvider);
    final localizations = AppLocalizations.of(context)!;
    final bgColor = isDarkMode
        ? ColorConstants.darkBackground
        : ColorConstants.lightBackground;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // タイトル
          Text(
            localizations.danmakuSettings,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),

          // 不透明度スライダー
          _SettingItem(
            label: localizations.opacity,
            value: '${(opacity * 100).toStringAsFixed(0)}%',
            child: Slider(
              value: opacity,
              onChanged: (value) {
                ref.read(danmakuOpacityProvider.notifier).state = value;
              },
              min: 0.0,
              max: 1.0,
              divisions: 10,
              activeColor: ColorConstants.lightPrimary,
              inactiveColor: Colors.grey[300],
            ),
          ),
          const SizedBox(height: 20),

          // 速度スライダー
          _SettingItem(
            label: localizations.speed,
            value: '${speedRate.toStringAsFixed(2)}x',
            child: Slider(
              value: speedRate,
              onChanged: (value) {
                ref.read(danmakuSpeedRateProvider.notifier).state = value;
              },
              min: 0.5,
              max: 3.0,
              divisions: 25,
              activeColor: ColorConstants.lightPrimary,
              inactiveColor: Colors.grey[300],
            ),
          ),
          const SizedBox(height: 20),

          // 表示/非表示トグル
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                localizations.danmakuVisibility,
                style: const TextStyle(fontSize: 16),
              ),
              Switch(
                value: isVisible,
                onChanged: (value) {
                  ref.read(danmakuVisibilityProvider.notifier).state = value;
                },
                activeColor: ColorConstants.lightPrimary,
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ボタン
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.grey[300],
                  foregroundColor: Colors.black,
                ),
                child: Text(localizations.cancel),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: ColorConstants.lightPrimary,
                ),
                child: Text(localizations.confirm),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// 設定項目ウィジェット
class _SettingItem extends StatelessWidget {
  final String label;
  final String value;
  final Widget child;

  const _SettingItem({
    required this.label,
    required this.value,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }
}
