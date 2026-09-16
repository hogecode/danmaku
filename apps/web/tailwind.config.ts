import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS設定
 * ✅ MUIとの共存対応
 * MUIコンポーネント: MUIのスタイルシステムを使用
 * その他: Tailwind Classesを使用
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /**
         * カスタムカラーパレット
         * MUIのデフォルトカラーも参照可能
         */
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716b',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
    },
  },
  plugins: [],
  // ✅ MUIとの競合を避けるため、Tailwindのプリフィックスは設定しない
  // ただしクラス名の競合がある場合は 'tw-' プリフィックスを検討
  // corePlugins: {
  //   preflight: false, // CSSBaselineとの競合を避ける場合はこれを有効にする
  // },
};

export default config;
