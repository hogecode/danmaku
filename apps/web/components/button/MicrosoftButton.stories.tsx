import type { Meta, StoryObj } from '@storybook/react';
import { MicrosoftButton } from './MicrosoftButton';
import { fn } from '@storybook/test';

const meta = {
  title: 'Components/Button/MicrosoftButton',
  component: MicrosoftButton,
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
} satisfies Meta<typeof MicrosoftButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトの Microsoft ログインボタン
 */
export const Default: Story = {
  args: {
    label: 'Microsoft でログイン',
  },
};

/**
 * ローディング状態のボタン
 */
export const Loading: Story = {
  args: {
    label: 'Microsoft でログイン',
    loading: true,
  },
};

/**
 * 無効化されたボタン
 */
export const Disabled: Story = {
  args: {
    label: 'Microsoft でログイン',
    disabled: true,
  },
};

/**
 * カスタムラベルのボタン
 */
export const CustomLabel: Story = {
  args: {
    label: 'Sign in with Microsoft',
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
    label: 'Microsoft でログイン',
    onPress: async () => {
      // MSWハンドラーがAPIをインターセプト
      try {
        const response = await fetch('/api/auth/login/microsoft');
        const data = await response.json();
        console.log('Login response:', data);
      } catch (error) {
        console.error('Login error:', error);
      }
    },
  },
};
