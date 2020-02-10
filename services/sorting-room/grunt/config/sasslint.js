// grunt/config/sasslint.js

module.exports = {
  options: {
    configFile: '.sass-lint.yml',
    formatter: 'stylish',
  },
  target: ['src/scss/**/*.scss', '!src/scss/vendor/**/*.scss'],
};
