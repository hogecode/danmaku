import type { Preview } from '@storybook/nextjs-vite'
import { handlers } from '../mocks/handlers'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: {
      handlers: handlers,
    },
  },
};

export default preview;