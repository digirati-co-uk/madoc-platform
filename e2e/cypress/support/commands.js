// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const LOCAL_STATE = {
  CURRENT_FIXTURE: null,
  timeout: null,
};

Cypress.Commands.add('loadSite', (fixtureName, clean = false) => {
  cy.fixture(`madoc-test-fixtures/${fixtureName}/export.json`).as('site-fixture');
  cy.get('@site-fixture').then((fixture) => {
    const validFixture = LOCAL_STATE.CURRENT_FIXTURE && LOCAL_STATE.CURRENT_FIXTURE === fixtureName;
    if (!validFixture || clean) {
      cy.task('site:fixture', fixture);
      LOCAL_STATE.CURRENT_FIXTURE = fixtureName;
      // Clear the fixture cache after 5 seconds.
      LOCAL_STATE.timeout = setTimeout(() => {
        LOCAL_STATE.CURRENT_FIXTURE = undefined;
      }, 10000);
    }
  });
});

Cypress.Commands.add('preserveCookies', () => {
  Cypress.Cookies.defaults({
    preserve: (cookie) => {
      return true;
    },
  });
});

Cypress.Commands.add('apiRequest', (userName, request, cb) => {
  return cy.get('@site-fixture').then((fixture) => {
    const user = fixture.omeka.users.find((u) => u.name === userName);
    if (!user) {
      throw new Error(`User ${userName} not found

Available users: 
${fixture.omeka.users.map((u) => `    - ${u.name}`).join('\n')}
      `);
    }
    const role = fixture.omeka.sitePermissions.find((p) => {
      return p.site_id === fixture.omeka.site.id && p.user_id === user.id;
    });
    // your cypress commands here
    cy.task('site:login', {
      user,
      site: fixture.omeka.site,
      role: role.role,
    }).then((token) => {
      return cy.request({
        auth: {
          bearer: token,
        },
        ...request,
      });
    });
  });
});
