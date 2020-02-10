module.exports = {
  dev: {
    crawl: false,
    customTests: [],
    dest: 'build/assets/js/vendor/modernizr-output.js',
    tests: ['flexbox'],
    options: [
      'setClasses',
    ],
    uglify: true,
  },
  dist: {
    crawl: false,
    customTests: [],
    dest: 'dist/assets/js/vendor/modernizr-output.js',
    tests: ['flexbox'],
    options: [
      'setClasses',
    ],
    uglify: true,
  },
};
