import { Platform, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const typeClasses = {
  default: 'text-base font-medium leading-6',
  title: 'text-5xl font-semibold leading-tight',
  small: 'text-sm font-medium leading-5',
  smallBold: 'text-sm font-bold leading-5',
  subtitle: 'text-2xl font-semibold leading-11',
  link: 'text-sm leading-7',
  linkPrimary: 'text-sm leading-7 text-blue-500',
  code: `text-xs font-mono ${Platform.select({ android: 'font-bold' }) ?? 'font-medium'}`,
};

export function ThemedText({ style, type = 'default', themeColor, className, ...rest }: ThemedTextProps & { className?: string }) {
  const theme = useTheme();

  return (
    <Text
      className={`${typeClasses[type as keyof typeof typeClasses]} ${className || ''}`}
      style={[
        { color: theme[themeColor ?? 'text'] },
        style,
      ]}
      {...rest}
    />
  );
}
