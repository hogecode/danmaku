import type { Meta, StoryObj } from '@storybook/react'

const Button = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button onClick={onClick} style={{ padding: '10px 20px', cursor: 'pointer' }}>
    {label}
  </button>
)

const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'Click me',
  },
}

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
  },
}
