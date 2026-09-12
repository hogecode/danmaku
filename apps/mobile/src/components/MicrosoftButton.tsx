/**
 * Microsoft Sign-In ボタンコンポーネント
 * 公式の Microsoft Design スタイルを再現
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MicrosoftSignInButtonProps {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function MicrosoftButton({
  onPress,
  disabled = false,
  loading = false,
  label = 'Sign in with Microsoft',
  style,
}: MicrosoftSignInButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        {
          height: 40,
          borderRadius: 20,
          backgroundColor: disabled ? 'rgba(0, 120, 212, 0.38)' : '#0078D4',
          borderWidth: 1,
          borderColor: disabled ? 'rgba(0, 120, 212, 0.38)' : '#0078D4',
          paddingHorizontal: 12,
          overflow: 'hidden',
          ...((isPressed && !disabled) && {
            shadowColor: 'rgba(0, 120, 212, 0.3)',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 2,
            elevation: 3,
          }),
          ...(!isPressed && !disabled && {
            shadowColor: 'rgba(0, 120, 212, 0)',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
          }),
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Microsoft Logo Icon */}
        {!loading && (
          <View style={{ width: 20, height: 20, marginRight: 10 }}>
            <MicrosoftLogoSVG />
          </View>
        )}

        {/* Loading Indicator */}
        {loading && <ActivityIndicator color="#FFFFFF" size="small" />}

        {/* Text Label */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: disabled ? 'rgba(255, 255, 255, 0.38)' : '#FFFFFF',
            fontFamily: 'Roboto, Arial, sans-serif',
            letterSpacing: 0.25,
            opacity: disabled ? 0.38 : 1,
          }}
        >
          {label}
        </Text>
      </View>

      {/* Ripple Effect Background */}
      {isPressed && !disabled && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            opacity: 0.12,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

/**
 * Microsoft ロゴ SVG コンポーネント
 * 4 つの四角形を使った シンプルなデザイン
 * ✅ エクスポート可能にしてアイコン利用を対応
 */
export function MicrosoftLogoSVG() {
  return (
    <Svg viewBox="0 0 48 48" width="100%" height="100%">
      {/* Top Left - Red */}
      <Path d="M0 0h20v20H0z" fill="#F25022" />
      {/* Top Right - Green */}
      <Path d="M28 0h20v20H28z" fill="#7FBA00" />
      {/* Bottom Left - Blue */}
      <Path d="M0 28h20v20H0z" fill="#00A4EF" />
      {/* Bottom Right - Yellow */}
      <Path d="M28 28h20v20H28z" fill="#FFB900" />
    </Svg>
  );
}
