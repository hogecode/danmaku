/**
 * ビデオプレイヤーの基本的な使用例
 */

import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { Player } from '../Player';
import type { PlayerConfig } from '../types';

/**
 * 基本的な使用例
 */
export function BasicPlayerExample() {
  const config: PlayerConfig = {
    container: null,
    video: {
      url: 'https://example.com/video.mp4',
      type: 'normal',
      pic: 'https://example.com/thumbnail.jpg',
    },
    autoplay: false,
    volume: 1,
    theme: '#E64F97',
    danmaku: {
      speedRate: 1,
      fontSize: 16,
      opacity: 0.8,
      unlimited: false,
    },
    apiBackend: {
      read: ({ success, error }) => {
        // コメント取得（例）
        setTimeout(() => {
          success([
            {
              time: 5,
              type: 'normal',
              color: '#ffffff',
              author: 'user1',
              text: 'Hello World!',
            },
            {
              time: 10,
              type: 'top',
              color: '#ff0000',
              author: 'user2',
              text: 'これはトップコメント',
            },
          ]);
        }, 1000);
      },
      send: ({ comment, success, error }) => {
        // コメント送信（例）
        console.log('Sending comment:', comment);
        setTimeout(() => {
          success();
        }, 500);
      },
    },
  };

  const handleReady = () => {
    console.log('Player is ready');
  };

  const handleError = (error: string) => {
    console.error('Player error:', error);
  };

  const handleDanmakuSend = (danmaku: any) => {
    console.log('Danmaku sent:', danmaku);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        <Player
          config={config}
          onReady={handleReady}
          onError={handleError}
          onDanmakuSend={handleDanmakuSend}
        />
      </View>
    </SafeAreaView>
  );
}
