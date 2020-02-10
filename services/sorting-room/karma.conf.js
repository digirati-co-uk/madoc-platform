module.exports = function(karma) {
  karma.set({
    frameworks: [ 'browserify', 'tap'],
    files: ['test/**/*.js'],
    preprocessors: {
      'test/**/*.js': [ 'browserify' ]
    },

    logLevel: 'LOG_DEBUG',

    plugins: [ 'karma-browserify', 'karma-chrome-launcher', 'karma-phantomjs-launcher', 'karma-tap'],

    reporters: [ 'dots' ],

    browserNoActivityTimeout: 100000,
    browsers: [ 'PhantomJS' ],

    singleRun: true,
    autoWatch: false,

    browserify: {
      debug: true,
      transform: [[ 'babelify', {presets: ['env']} ]]
    }
  });
}