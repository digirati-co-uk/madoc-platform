const path = require('path');
console.log(`Webpack frontend, env: ${process.env.NODE_ENV || 'development'}`);

const createStyledComponentsTransformer = require('typescript-plugin-styled-components').default;
const styledComponentsTransformer = createStyledComponentsTransformer({
  displayName: true,
  minify: false,
  ssr: false,
});
const { addDisplayNameTransformer } = require('ts-react-display-name');

module.exports = {
  // mode: process.env.NODE_ENV || 'development',
  // devtool: process.env.NODE_ENV !== 'production' ? 'inline-source-map' : false,
  // output: {
  //   filename: 'bundle.js',
  //   pathinfo: false,
  //   publicPath: `/s/default/madoc/assets/${process.env.MADOC_BUNDLE_ID}/`,
  // },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        // use: 'ts-loader',
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: 'tsconfig.frontend.json',
              silent: true,
              useBabel: true,
              useCache: true,
              useTranspileModule: true,
              transpileOnly: true,
              cacheDirectory: path.resolve(__dirname, '.cache', 'typescript'),
              babelOptions: {
                babelrc: false,
              },
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-react'],
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
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@atlas-viewer/atlas': require.resolve('@atlas-viewer/atlas'),
      '@capture-models/editor': '@capture-models/editor/lib',
      // '@capture-models/editor': ['@capture-models/editor/lib', '@capture-models/editor'],
      // https: false,
      // http: false,
      // '@blueprintjs/core': false,
    },
  },
  externals: {
    // react: 'React',
    // 'react-dom': 'ReactDOM',
  },
};
