// grunt/config/browsersync.js

module.exports = {
  dev: {
    bsFiles: {
      src: ['build/assets/css/*.css', 'build/assets/js/*.js', 'build/*.html'],
    },
    options: {
      directory: true,
      watchTask: true,
      server: './build',
      startPath: 'index.html'
    },
  },

  dist: {
    bsFiles: {
      src: ['dist/assets/css/*.css', 'dist/assets/js/*.js', 'dist/*.html'],
    },
    options: {
      directory: true,
      watchTask: false,
      server: './dist',
      startPath: 'index.html'
    },
  },

  styleguide: {
    bsFiles: {
      src: ['build/styleguide/**/*.*'],
    },
    options: {
      watchTask: false,
      server: './src/styleguide',
    },
  },

  test: {
    bsFiles: {
      src: ['dist/assets/css/*.css', 'dist/assets/js/*.js', 'dist/*.html'],
    },
    watchOptions: {
      ignoreInitial: true,
    },
    options: {
      background: true,
      open: false,
      notify: false,
      watchTask: false,
      server: './dist',
    },
  },
};
