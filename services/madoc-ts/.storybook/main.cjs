module.exports = {
    stories: [
        // "../src/**/*.stories.mdx",
        '../stories/**/*.stories.@(tsx|mdx)',
        '../src/**/*.stories.@(tsx|mdx)'
    ],
    addons: [
        // '@storybook/preset-typescript',
        // '@storybook/addon-knobs',
        // '@storybook/addon-docs',
        // '@storybook/addon-essentials',
        // "storybook-addon-styled-component-theme/dist/preset"
    ],
    framework: "@storybook/react",
    core: {
        builder: "@storybook/builder-vite"
    },
};
