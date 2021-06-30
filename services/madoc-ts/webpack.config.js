const webpack = require('webpack');
const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const styledComponentsTransformer = createStyledComponentsTransformer({
  displayName: true,
});

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: process.env.NODE_ENV !== 'production' ? 'eval-cheap-module-source-map' : false,
  entry: {
    admin: [
      './src/frontend/admin/client.tsx',
      process.env.NODE_ENV === 'development' &&
        process.env.watch === 'false' &&
        'webpack-hot-middleware/client?name=admin&path=/s/default/madoc/__webpack_hmr&quiet=false&noInfo=false',
    ].filter(Boolean),
    site: [
      './src/frontend/site/client.ts',
      process.env.NODE_ENV === 'development' &&
        process.env.watch === 'false' &&
        'webpack-hot-middleware/client?name=site&path=/s/default/madoc/__webpack_hmr&quiet=false&noInfo=false',
    ].filter(Boolean),
  },
  output: {
    path: __dirname + '/lib/frontend/build',
    filename: '[name].bundle.js',
    pathinfo: false,
    publicPath: `/s/default/madoc/assets/`,
  },
  plugins:
    process.env.NODE_ENV === 'production'
      ? [new webpack.IgnorePlugin(/@blueprintjs\/core/)]
      : [
          new webpack.HotModuleReplacementPlugin(),
          new ReactRefreshWebpackPlugin(),
          new webpack.IgnorePlugin(/@blueprintjs\/core/),
        ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [process.env.NODE_ENV !== 'production' && require.resolve('react-refresh/babel')].filter(
                Boolean
              ),
              presets: [
                process.env.NODE_ENV === 'production' && [
                  '@babel/preset-env',
                  {
                    targets: {
                      edge: '17',
                      firefox: '60',
                      chrome: '67',
                      safari: '11.1',
                    },
                    modules: 'commonjs',
                    useBuiltIns: 'usage',
                    corejs: 3,
                  },
                ],
              ].filter(Boolean),
            },
          },
          {
            loader: require.resolve('ts-loader'),
            options: {
              configFile: 'tsconfig.frontend.json',
              transpileOnly: true,
              experimentalWatchApi: true,
              getCustomTransformers: () => ({
                before: [styledComponentsTransformer],
              }),
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      '@atlas-viewer/atlas': require.resolve('@atlas-viewer/atlas'),
      '@capture-models/editor': '@capture-models/editor/lib',
      'react-dnd': require.resolve('react-dnd'),
      'styled-components': require.resolve('styled-components'),
    },
    // fallback: {
    //   https: false,
    //   http: false,
    //   '@blueprintjs/core': false,
    // },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
