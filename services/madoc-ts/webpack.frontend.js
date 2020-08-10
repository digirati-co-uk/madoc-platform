console.log(`Webpack frontend, env: ${process.env.NODE_ENV || 'development'}`);

const { addDisplayNameTransformer } = require('ts-react-display-name');

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
              transpileOnly: true,
              experimentalWatchApi: true,
              getCustomTransformers: () => ({
                before: [addDisplayNameTransformer()],
              }),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
