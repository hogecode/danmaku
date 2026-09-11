/**
 * カラーピッカーコンポーネント
 * 6種類の色プリセットから選択
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface ColorPickerWrapperProps {
  color: string; // HEX カラーコード（#RRGGBB）
  onColorChange: (color: string) => void;
}

// コメント用の標準色プリセット
const COLOR_PRESETS = [
  { name: '白', hex: '#FFFFFF' },
  { name: '赤', hex: '#FF0000' },
  { name: '青', hex: '#0000FF' },
  { name: '黄', hex: '#FFFF00' },
  { name: '緑', hex: '#00FF00' },
  { name: 'ピンク', hex: '#FF69B4' },
];

export const ColorPickerComponent: React.FC<ColorPickerWrapperProps> = ({
  color,
  onColorChange,
}) => {
  const [displayColor, setDisplayColor] = useState(color);

  // 色を選択
  const handleColorSelect = (hex: string) => {
    setDisplayColor(hex);
    onColorChange(hex);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>

      {/* カラープリセット */}
      <Text
        style={{
          color: '#fff',
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 12,
        }}
      >
        色を選択
      </Text>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {COLOR_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.hex}
            onPress={() => handleColorSelect(preset.hex)}
            style={{
              width: '48%',
              paddingVertical: 12,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: preset.hex,
              borderWidth: 3,
              borderColor: displayColor === preset.hex ? '#FFF' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 6,
            }}
          >
            {displayColor === preset.hex && (
              <Icon name="check" size={16} color={preset.hex === '#FFFFFF' || preset.hex === '#FFFF00' ? '#000' : '#fff'} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ColorPickerComponent;
