// grunt/config/groc.js

module.exports = {
  options: {
    out: 'docs/',
  },
  site: [
    'README.md',
    'Gruntfile.js',

    // > Scripts
    'src/js/**/*.js',
    '!src/js/vendor/**/*.js',

    // > SASS
    'src/scss/**/*.scss',

    // > Templates
    'src/views/atoms/**/*.hbs',
    'src/views/molecules/**/*.hbs',
    'src/views/organisms/**/*.hbs',
    'src/views/templates/**/*.hbs',
    'src/views/layouts/**/*.hbs',
    'src/views/partials/**/*.hbs',
  ],
};
