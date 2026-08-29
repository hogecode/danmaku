import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_app/core/constants/color_constants.dart';
import 'package:flutter_app/core/themes/app_theme.dart';
import 'package:flutter_app/presentation/providers/ui_provider.dart';
import 'package:flutter_app/presentation/widgets/settings/danmaku_settings.dart';

class SettingsDemoPage extends ConsumerWidget {
  const SettingsDemoPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(darkModeProvider);
    final opacity = ref.watch(danmakuOpacityProvider);
    final speed = ref.watch(danmakuSpeedRateProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('設定デモ'),
        backgroundColor: ColorConstants.lightPrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // テーマ切り替え
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('テーマ設定', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(isDark ? 'ダークモード' : 'ライトモード'),
                        Switch(
                          value: isDark,
                          onChanged: (v) => ref.read(darkModeProvider.notifier).state = v,
                          activeColor: ColorConstants.lightPrimary,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ダンマク設定プレビュー
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('ダンマク設定', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Text('不透明度: ${(opacity * 100).toInt()}%'),
                    Slider(
                      value: opacity,
                      onChanged: (v) => ref.read(danmakuOpacityProvider.notifier).state = v,
                      min: 0,
                      max: 1,
                    ),
                    const SizedBox(height: 12),
                    Text('速度: ${speed.toStringAsFixed(2)}x'),
                    Slider(
                      value: speed,
                      onChanged: (v) => ref.read(danmakuSpeedRateProvider.notifier).state = v,
                      min: 0.5,
                      max: 3.0,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 再生速度
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('再生速度', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 4,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.5,
                      mainAxisSpacing: 8,
                      crossAxisSpacing: 8,
                      children: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
                          .map((s) => Material(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(8),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(8),
                              onTap: () {},
                              child: Center(child: Text('${s.toStringAsFixed(2)}x')),
                            ),
                          ))
                          .toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 詳細設定パネル
            ElevatedButton(
              onPressed: () => showModalBottomSheet(
                context: context,
                backgroundColor: Colors.transparent,
                builder: (_) => Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: const DanmakuSettingsPanel(),
                ),
              ),
              child: const Text('詳細設定を開く'),
            ),
          ],
        ),
      ),
    );
  }
}
