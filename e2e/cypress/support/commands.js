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
};

Cypress.Commands.add('loadSite', (fixtureName, clean = false) => {
  cy.fixture(`madoc-test-fixtures/${fixtureName}/export.json`).as('site-fixture');
  cy.get('@site-fixture').then((fixture) => {
    if (LOCAL_STATE.CURRENT_FIXTURE !== fixture || clean) {
      cy.task('site:fixture', fixture);
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
