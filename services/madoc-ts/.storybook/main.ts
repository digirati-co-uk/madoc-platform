import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(tsx|mdx)', '../src/**/*.stories.@(tsx|mdx)'],
  addons: ['@storybook/addon-docs'],
  features: {
    interactionsDebugger: true,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.js',
      },
    },
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      build: {
        rollupOptions: {
          external: ['csv-stringify'],
        },
      },
    });
  },
};

export default config;
