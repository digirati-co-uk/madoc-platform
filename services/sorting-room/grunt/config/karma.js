const isparta = require('isparta');
const istanbul = require('browserify-istanbul');

module.exports = {
  unit: {
    configFile: 'karma.conf.js',
    options: {
      frameworks: ['browserify', 'tap'],
      files: ['src/js/**/*.js', 'test/unit/**/*.js'],

      logLevel: 'LOG_DEBUG',

      plugins: [
        'karma-coverage',
        'karma-browserify',
        'karma-chrome-launcher',
        'karma-phantomjs-launcher',
        'karma-tap',
      ],

      reporters: ['dots', 'coverage'],

      preprocessors: {
        'src/js/**/*.js': ['browserify', 'coverage'],
        'test/unit/**/*.js': ['browserify'],
      },

      browsers: ['PhantomJS'],

      singleRun: true,
      autoWatch: false,

      browserify: {
        debug: true,
        transform: [['babelify', { presets: ['env', 'react'] },
          istanbul({
            instrumenter: isparta,
            ignore: ['**/node_modules/**', '**/test/**'],
          })]],
      },
    },
  },
};
