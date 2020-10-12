const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const styledComponentsTransformer = createStyledComponentsTransformer({
  displayName: true,
});

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: process.env.NODE_ENV !== 'production' ? 'inline-source-map' : false,
  output: {
    filename: 'bundle.js',
    pathinfo: false,
    publicPath: `/s/default/madoc/assets/${process.env.MADOC_BUNDLE_ID}/`,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
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
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'babel-plugin-styled-components',
                'babel-plugin-transform-typescript-metadata',
                ['@babel/plugin-proposal-decorators', { legacy: true }],
              ],
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      edge: '17',
                      firefox: '60',
                      chrome: '67',
                      safari: '11.1',
                    },
                    useBuiltIns: 'usage',
                  },
                ],
              ],
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
      '@capture-models/editor': ['@capture-models/editor/lib', '@capture-models/editor'],
      https: false,
      http: false,
      '@blueprintjs/core': false,
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
