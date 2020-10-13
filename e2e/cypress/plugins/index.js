// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
const path = require('path');
const { JWK, JWT } = require('jose');
const { readFileSync } = require('fs');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const watch = require('@cypress/watch-preprocessor');
const pickle = require('picklejs/cypress/plugin');
const fetch = require('node-fetch');
const madocConfig = require('../../test-fixtures/madoc-ts-config.json');

const Docker = require('dockerode');

const docker = new Docker();

const key = JWK.asKey(readFileSync(path.join(__dirname, '../../test-fixtures/certs/madoc.key')));

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('file:preprocessor', watch());
  on(
    'file:preprocessor',
    webpackPreprocessor({
      webpackOptions: {
        watch: true,
      },
    })
  );

  // Pickle plugin.
  pickle(on);

  on('task', {
    async 'site:login'({ site, user, role }) {
      return JWT.sign(
        {
          scope: madocConfig.permissions[role].join(' '),
          iss_name: site.name,
          name: user.name,
        },
        key,
        {
          subject: `urn:madoc:user:${user.id}`,
          issuer: `urn:madoc:site:${site.id}`,
          header: {
            typ: 'JWT',
            alg: 'RS256',
          },
          expiresIn: `2000s`,
        }
      );
    },
    async 'site:fixture'(fixture) {
      const siteId = fixture.omeka.site.id;

      // Generate JWT for admin user.
      const token = JWT.sign(
        {
          scope: 'site.admin',
          iss_name: 'Default site',
          name: 'Admin',
        },
        key,
        {
          subject: `urn:madoc:user:1`,
          issuer: `urn:madoc:site:${siteId}`,
          header: {
            typ: 'JWT',
            alg: 'RS256',
          },
          expiresIn: `2000s`,
        }
      );

      const resp = await fetch(`${config.baseUrl}/api/madoc/site/${siteId}/import`, {
        body: JSON.stringify(fixture),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        return true;
      }

      // Post file to site.
      throw new Error(`Importing fixture failed`);
    },
    async 'db:omeka:reset'() {
      const container = docker.getContainer('test-madoc_madoc-database_1');

      await new Promise((resolve) => {
        container.exec(
          {
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            DetachKeys: 'ctrl-p,ctrl-q',
            Tty: false,
            Cmd: ['/opt/tools/reset-database.sh'],
            Env: [],
          },
          (err, exec) => {
            exec.start({}).then((r) => {
              r.on('data', (e) => {
                // no-op
              });
              r.on('end', () => {
                resolve();
              });
            });
          }
        );
      });

      return container;
    },
  });
};
