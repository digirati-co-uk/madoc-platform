// grunt/config/protractor.js

module.exports = {
  options: {
    configFile: 'protractor.conf.js', // Default config file
    keepAlive: false, // If false, the grunt process stops when the test fails.
    noColor: false, // If true, protractor will not use colors in its output.
  },
  all: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
    options: {
      configFile: 'protractor.conf.js', // Target-specific config file
    },
  },
};
