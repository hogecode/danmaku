import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, className, ...otherProps }: ThemedViewProps & { className?: string }) {
  const theme = useTheme();

  return (
    <View 
      className={className}
      style={[{ backgroundColor: theme[type ?? 'background'] }, style]} 
      {...otherProps} 
    />
  );
}
