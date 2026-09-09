/**
 * ダンマク（コメント）入力フォームコンポーネント
 */

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import type { Danmaku } from '../types';

interface DanmakuFormProps {
  visible: boolean;
  onSubmit: (danmaku: Danmaku) => void;
  onCancel: () => void;
  currentTime: number;
}

const COLOR_OPTIONS = [
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
];

export const DanmakuForm: React.FC<DanmakuFormProps> = ({
  visible,
  onSubmit,
  onCancel,
  currentTime,
}) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [type, setType] = useState<'normal' | 'top' | 'bottom'>('normal');

  const handleSubmit = () => {
    if (!text.trim()) {
      return;
    }

    onSubmit({
      time: currentTime,
      type,
      color,
      author: 'anonymous',
      text: text.trim(),
    });

    setText('');
    setColor('#ffffff');
    setType('normal');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/70 justify-center items-center">
        <View className="bg-neutral-900 w-11/12 rounded-lg p-4 gap-4">
          <Text className="text-white text-lg font-bold">コメント送信</Text>

          <TextInput
            placeholder="コメントを入力..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            className="bg-neutral-800 text-white px-3 py-2 rounded border border-neutral-700"
            maxLength={200}
            multiline
          />

          <View className="gap-2">
            <Text className="text-white text-sm font-semibold">表示タイプ</Text>
            <View className="flex-row gap-2">
              {(['normal', 'top', 'bottom'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`flex-1 py-2 rounded ${
                    type === t ? 'bg-pink-500' : 'bg-neutral-800'
                  }`}
                >
                  <Text className="text-white text-center text-xs">
                    {t === 'normal' ? 'スクロール' : t === 'top' ? '上部' : '下部'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-white text-sm font-semibold">色</Text>
            <View className="flex-row flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-10 h-10 rounded border-2 ${
                    color === c ? 'border-white' : 'border-neutral-700'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </View>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-2 rounded bg-neutral-800"
            >
              <Text className="text-white text-center font-semibold">キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!text.trim()}
              className={`flex-1 py-2 rounded ${
                text.trim() ? 'bg-pink-500' : 'bg-neutral-700'
              }`}
            >
              <Text className="text-white text-center font-semibold">送信</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
