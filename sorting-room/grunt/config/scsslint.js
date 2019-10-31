// grunt/config/scsslint.js

module.exports = {
  options: {
    colorizeOutput: true,
  },

  allFiles: ['src/scss/**/*.scss', '!src/scss/vendor/**/*.scss'],
};
