/// <reference types="../../types" />

describe('Delete collection', () => {
  before(() => {
    cy.loadSite('empty-site-users', true);
  });

  it('Admins should be able to delete collections', () => {
    cy.siteLogin('admin');

    // Verify there are initially 2 collections
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="collection-count"]').should(
      'have.text',
      '2',
    );

    // Delete manifest
    cy.visit('/s/default/madoc/admin/collections/1/delete');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Delete collection').should('be.enabled');
    cy.react('Button').contains('Delete collection').click();
    cy.waitForReact(1000, '.react-loaded');

    // TODO is this long enough?
    cy.wait(10000);

    // Verify there is now 1 collection
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="collection-count"]').should(
      'have.text',
      '1',
    );
  });
});