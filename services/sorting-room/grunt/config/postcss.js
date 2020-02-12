// grunt/config/postcss.js

module.exports = {
  options: {
    processors: [
      require('pixrem')(), // eslint-disable-line global-require
      require('autoprefixer')({ // eslint-disable-line global-require
        browsers: 'last 2 versions',
      }),
      require('cssnano')({ // eslint-disable-line global-require
        safe: true,
      }),
    ],
  },
  dev: {
    options: {
      map: true,
    },
    src: 'build/assets/css/*.css',
  },

  dist: {
    options: {
      map: false,
    },
    src: 'dist/assets/css/*.css',
  },
};
