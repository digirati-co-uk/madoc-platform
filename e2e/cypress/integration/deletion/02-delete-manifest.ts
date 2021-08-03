/// <reference types="../../types" />

describe('Delete manifest', () => {
  before(() => {
    cy.loadSite('empty-site-users', true);
  });

  it('Admins should be able to delete manifests', () => {
    cy.siteLogin('admin');

    // Verify there are initially 2 manifests and 131 canvases
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="manifest-count"]').should(
      'have.text',
      '2',
    );
    cy.get('[data-cy="canvas-count"]').should(
      'have.text',
      '131',
    );

    // Delete manifest
    cy.visit('/s/default/madoc/admin/manifests/2/delete');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Delete Manifest').should('be.enabled');
    cy.react('Button').contains('Delete Manifest').click();
    cy.waitForReact(1000, '.react-loaded');

    // TODO is this long enough?
    cy.wait(10000);

    // Verify there is now 1 manifest and 91 canvases
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="manifest-count"]').should(
      'have.text',
      '1',
    );
    cy.get('[data-cy="canvas-count"]').should(
      'have.text',
      '91',
    );
  });
});