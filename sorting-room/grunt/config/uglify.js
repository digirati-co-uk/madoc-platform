module.exports = {
  options: {
    compress: {
      drop_console: true,
    },
  },
  build: {
    files: {
      'build/assets/js/script.min.js': ['build/assets/js/script.js'],
    },
  },
};
