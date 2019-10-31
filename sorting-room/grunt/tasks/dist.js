// grunt/tasks/dist.js

module.exports = function (grunt) {
  grunt.registerTask('dist', [
    'clean:dist',
    'assemble:dist',
    'sasslint',
    'sass:dist',
    'postcss:dist',
    'browserify:dist',
    //'accessibility',
    'groc',
    'modernizr:dist',
    'copy:dist']);
};
