/// <reference types="../../types" />

describe('Site navigation configuration', () => {
  before(() => {
    cy.loadSite('empty-site-users', true);
  });

  beforeEach(() => {
    cy.loadSite('empty-site-users');
    cy.visit('/logout');
  });

  it('Models should show message when preparing for a transcriber', () => {
    cy.siteLogin('Transcriber');
    cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/8/model');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('InfoMessage').should('contain', 'Preparing this image');
    // Its now loaded.
    cy.waitUntil(() => {
      return Cypress.$('[data-cy="info-message"]').length === 0;
    });
    // And it should automatically select the form.
    cy.react('TextField', { props: { label: 'description' } }).type('An example value');
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="publish-button"]').click();
    cy.get('[data-cy="publish-button"]').should('be.disabled');
    cy.get('[data-cy="close-add-another"]').click();
    // Now its' saved
    // Now do it again.
    cy.react('TextField', { props: { label: 'description' } }).type('An second value');
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="publish-button"]').click();
    cy.get('[data-cy="publish-button"]').should('be.disabled');
    // Now assert the thank you page.
    cy.get('[data-cy="go-to-next-image"]').click();
    // We should be on number 6.
    cy.react('BreadcrumbItem').contains('6');
  });

  it('Models should not show message when preparing for viewer', () => {
    cy.siteLogin('Viewer');
    cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/9/model');
    cy.waitForReact(1000, '.react-loaded');
    cy.waitUntil(() => {
      return Cypress.$('[data-cy="info-message"]').length === 0;
    });
  });

  it('Models should still render with a choice', () => {
    cy.siteLogin('Transcriber');
    cy.visit('/s/default/madoc/projects/project-with-choice/manifests/2/c/8/model');
    cy.waitForReact(1000, '.react-loaded');

    cy.get('label').contains('Choice A').click();
    cy.get('label').contains('Field A');
    cy.react('TextField', { props: { label: 'Field A' } }).type('An example value');
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="publish-button"]').click();
    // Assert both options still there.
    cy.get('[data-cy="close-add-another"]').click();
    cy.get('label').contains('Choice A');
    cy.get('label').contains('Choice B');
  });
});
