/**
 * カラーピッカーコンポーネント
 * reanimated-color-picker を使用
 */

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ColorPicker, { HueSlider, SaturationSlider, BrightnessSlider, OpacitySlider } from 'reanimated-color-picker';
import type { ColorFormatsObject } from 'reanimated-color-picker';

interface ColorPickerWrapperProps {
  color: string; // HEX カラーコード（#RRGGBB）
  onColorChange: (color: string) => void;
}

export const ColorPickerComponent: React.FC<ColorPickerWrapperProps> = ({
  color,
  onColorChange,
}) => {
  const [displayColor, setDisplayColor] = useState(color);

  // JS スレッドで実行 - 最終色を確定
  const handleColorComplete = (colors: ColorFormatsObject) => {
    setDisplayColor(colors.hex);
    onColorChange(colors.hex);
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* カラープレビュー */}
      <View
        style={{
          height: 60,
          borderRadius: 8,
          backgroundColor: displayColor,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: '#555',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Text
          style={{
            color: displayColor === '#FFFFFF' || displayColor === '#FFFF00' ? '#000' : '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
          }}
        >
          {displayColor}
        </Text>
      </View>

      {/* カラーピッカー */}
      <ColorPicker
        value={displayColor}
        onCompleteJS={handleColorComplete}
        sliderThickness={20}
        thumbSize={24}
        thumbShape="circle"
      >
        <View>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#fff' }}>
            Hue
          </Text>
          <HueSlider style={{ height: 30, borderRadius: 8 }} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#fff' }}>
            Saturation
          </Text>
          <SaturationSlider style={{ height: 30, borderRadius: 8 }} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#fff' }}>
            Brightness
          </Text>
          <BrightnessSlider style={{ height: 30, borderRadius: 8 }} />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#fff' }}>
            Opacity
          </Text>
          <OpacitySlider style={{ height: 30, borderRadius: 8 }} />
        </View>
      </ColorPicker>
    </View>
  );
};

export default ColorPickerComponent;
