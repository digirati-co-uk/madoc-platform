import init from 'picklejs/cypress';
import generateAutoPhrases from 'picklejs/cypress';

import { setScreens, setElementSelector, SCREENS } from 'picklejs/common/variables';

import selectors from './selectors.json';
import screens from './screens.json';
import { REDIRECTED_TO, ON_PAGE } from 'picklejs/common/regex';

// Bug with equality.
const redirectedTo = (screen) => {
  cy.url().should('eq', Cypress.config().baseUrl + SCREENS[screen]);
};

Then(REDIRECTED_TO, redirectedTo);
Then(ON_PAGE, redirectedTo);

Given('I am using the {string} site template', (fixtureName) => {
  // your cypress commands here
  // cy.fixture(`madoc-test-fixtures/${fixtureName}/export.json`).as('site-fixture');
  // cy.get('@site-fixture').then((fixture) => {
  //   cy.task('site:fixture', fixture);
  // });
  cy.loadSite(fixtureName);
});

When('I view task with id {string}', (taskId) => {
  cy.get('@site-fixture').then((fixture) => {
    cy.visit(`/s/${fixture.omeka.site.slug}/madoc/tasks/${taskId}`);
  });
});

Given('I have logged in as {string} on site {string}', (userName) => {
  cy.get('@site-fixture').then((fixture) => {
    cy.preserveCookies();
    // Cypress.Cookies.defaults({
    //   preserve: (cookie) => {
    //     console.log('Cookie?', cookie);
    //     return true;
    //   },
    // });

    const user = fixture.omeka.users.find((u) => u.name === userName);
    const role = fixture.omeka.sitePermissions.find((p) => {
      return p.site_id === fixture.omeka.site.id && p.user_id === user.id;
    });
    // your cypress commands here
    cy.task('site:login', {
      user,
      site: fixture.omeka.site,
      role: role.role,
    }).then((token) => {
      const slug = fixture.omeka.site.slug;
      cy.setCookie('madoc-sites', slug, {
        path: `/`,
        domain: 'localhost',
      });
      cy.setCookie(`madoc/${slug}`, token, {
        path: `/s/${slug}`,
        domain: 'localhost',
      });
    });
  });
});

generateAutoPhrases();
setScreens(screens);
setElementSelector(selectors);

init();
