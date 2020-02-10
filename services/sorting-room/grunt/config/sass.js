// grunt/config/sass.js

module.exports = {
  dev: {
    options: {
      outputStyle: 'expanded',
      sourceMap: true,
    },
    files: {
      'build/assets/css/styles.css': 'src/scss/styles.scss',
    },
  },

  dist: {
    options: {
      outputStyle: 'compressed',
      sourceMap: false,
    },
    files: {
      'dist/assets/css/styles.css': 'src/scss/styles.scss',
    },
  },
};
