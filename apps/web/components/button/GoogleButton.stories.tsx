import type { Meta, StoryObj } from '@storybook/react';
import { GoogleButton } from './GoogleButton';
import { fn } from '@storybook/test';

const meta = {
  title: 'Components/Button/GoogleButton',
  component: GoogleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onPress: { action: 'pressed' },
    disabled: {
      control: 'boolean',
      description: 'ボタンを無効化',
    },
    loading: {
      control: 'boolean',
      description: 'ローディング状態を表示',
    },
    label: {
      control: 'text',
      description: 'ボタンのラベル',
    },
  },
  args: {
    onPress: fn(),
  },
} satisfies Meta<typeof GoogleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトの Google ログインボタン
 */
export const Default: Story = {
  args: {
    label: 'Google でログイン',
  },
};

/**
 * ローディング状態のボタン
 */
export const Loading: Story = {
  args: {
    label: 'Google でログイン',
    loading: true,
  },
};

/**
 * 無効化されたボタン
 */
export const Disabled: Story = {
  args: {
    label: 'Google でログイン',
    disabled: true,
  },
};

/**
 * カスタムラベルのボタン
 */
export const CustomLabel: Story = {
  args: {
    label: 'Sign in with Google',
  },
};

/**
 * MSWハンドラーとの連携例
 * クリック時にモックAPIを呼び出します
 */
export const WithMSWIntegration: Story = {
  parameters: {
    msw: {
      handlers: [],
    },
  },
  args: {
    label: 'Google でログイン',
    onPress: async () => {
      // MSWハンドラーがAPIをインターセプト
      try {
        const response = await fetch('/api/auth/login/google');
        console.log('Login response:', response);
      } catch (error) {
        console.error('Login error:', error);
      }
    },
  },
};
