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
            },
          },
        ],
      },
      {
        test: /\.js$/,
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
                'react',
                [
                  'es2015',
                  {
                    modules: false,
                  },
                ],
                'es2016',
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
      '@babel/runtime': '@babel/runtime',
      '@babel/runtime/helpers': '@babel/runtime/helpers',
      '@babel/runtime/helpers/esm': '@babel/runtime/helpers',
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
