// grunt/tasks/test.js

module.exports = function (grunt) {
  grunt.registerTask('test', [
    //'scsslint',
    'eslint',
    'browserSync:test',
    'accessibility',
    'phantomas',
    'karma',
    'protractor']);
};
