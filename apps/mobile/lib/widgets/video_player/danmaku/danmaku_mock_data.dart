import 'package:flutter/material.dart';
import 'package:mobile/presentation/widgets/video_player/danmaku/danmaku_particle.dart';

/// テスト用のダミーダンマクデータ
class DanmakuMockData {
  static List<DanmakuEntity> getSampleDanmakuList() {
    return [
      DanmakuEntity(
        text: 'こんにちは',
        time: 2.0,
        type: DanmakuType('right'),
        color: Colors.white,
      ),
      DanmakuEntity(
        text: '素晴らしい！',
        time: 5.0,
        type: DanmakuType('right'),
        color: Colors.red,
      ),
      DanmakuEntity(
        text: 'もう一度見たい',
        time: 8.0,
        type: DanmakuType('right'),
        color: Colors.blue,
      ),
      DanmakuEntity(
        text: 'TOP コメント',
        time: 10.0,
        type: DanmakuType('top'),
        color: Colors.yellow,
      ),
      DanmakuEntity(
        text: 'BOTTOM コメント',
        time: 12.0,
        type: DanmakuType('bottom'),
        color: Colors.green,
      ),
      DanmakuEntity(
        text: '後半戦',
        time: 15.0,
        type: DanmakuType('right'),
        color: Colors.white,
      ),
      DanmakuEntity(
        text: '素晴らしい',
        time: 18.0,
        type: DanmakuType('right'),
        color: Colors.purple,
      ),
      DanmakuEntity(
        text: '最高です',
        time: 20.0,
        type: DanmakuType('right'),
        color: Colors.cyan,
      ),
    ];
  }
}
