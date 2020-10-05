// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
const webpackPreprocessor = require('@cypress/webpack-preprocessor')
const watch = require('@cypress/watch-preprocessor')
const Docker = require('dockerode');

const docker = new Docker();

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('file:preprocessor', watch())
  on('file:preprocessor', webpackPreprocessor({
    webpackOptions: {
      watch: true,
    }
  }))

  on("task", {
    async "db:omeka:reset"() {
      const container = docker.getContainer('test-madoc_madoc-database_1');

      await new Promise(resolve => {
        container.exec({
          "AttachStdin": false,
          "AttachStdout": true,
          "AttachStderr": true,
          "DetachKeys": "ctrl-p,ctrl-q",
          "Tty": false,
          "Cmd": [
            "/opt/tools/reset-database.sh"
          ],
          "Env": []
        }, (err, exec) => {
          exec.start({}).then(r => {
            r.on('data', (e) => {
             // no-op
            })
            r.on('end', () => {
              resolve();
            })
          });
        })
      })

      return container;
    },
  });
}
