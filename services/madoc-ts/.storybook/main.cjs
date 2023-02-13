const { mergeConfig } = require('vite');

module.exports = {
  stories: [
  // "../src/**/*.stories.mdx",
  '../stories/**/*.stories.@(tsx|mdx)', '../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  features: {
    interactionsDebugger: true,
  },
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      build: {
        rollupOptions: {
          external: ['csv-stringify'],
        }
      }
    })
  }
};
