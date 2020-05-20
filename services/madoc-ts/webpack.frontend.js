module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    pathinfo: false,
    publicPath: '/s/default/madoc/assets/admin/',
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
