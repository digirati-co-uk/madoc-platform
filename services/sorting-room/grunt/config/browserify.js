// grunt/config/browserify.js

module.exports = {
  dev: {
    options: {
      browserifyOptions: {
        debug: true,
      },
      transform: [['babelify', { presets: ['env'] }]],
    },
    src: ['src/js/script.js'],
    dest: 'build/assets/js/script.js',
  },

  dist: {
    options: {
      transform: [['babelify', { presets: ['env'] }]],
    },
    src: ['src/js/script.js'],
    dest: 'dist/assets/js/script.js',
  },
};
