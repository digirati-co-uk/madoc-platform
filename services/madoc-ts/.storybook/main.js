module.exports = {
    stories: ['../stories/**/*.stories.@(tsx|mdx)'],
    addons: [
        '@storybook/preset-typescript',
        '@storybook/addon-knobs',
        '@storybook/addon-docs',
        '@storybook/addon-essentials',
    ],
    webpackFinal: async config => {
        // config.module.rules.push({
        //     test: /\.(ts|tsx)$/,
        //     use: [
        //         {
        //             loader: require.resolve('ts-loader'),
        //             options: {
        //                 transpileOnly: true,
        //                 experimentalWatchApi: true,
        //             }
        //         },
        //     ],
        // });

        config.optimization.removeAvailableModules = false;
        config.optimization.removeEmptyChunks = false;
        config.optimization.splitChunks = false;

        // config.resolve.extensions.push('.ts', '.tsx');
        return config;
    },
};
