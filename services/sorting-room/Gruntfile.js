module.exports = function(grunt) {
  var path = require('path');

  require('load-grunt-config')(grunt, {
    configPath: path.join(process.cwd(), 'grunt/config'),
    jitGrunt: {
      customTasksDir: 'grunt/tasks',

      staticMappings: {
        assemble: 'grunt-assemble',
        browserSync: 'grunt-browser-sync',
        protractor: 'grunt-protractor-runner',
        sasslint: 'grunt-sass-lint'
      }
    }
  });
};
