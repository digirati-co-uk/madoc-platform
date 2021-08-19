/// <reference types="../../types" />

describe('Delete canvas', () => {
  before(() => {
    cy.loadSite('empty-site-users', true);
  });

  it('Admins should be able to delete canvases', () => {
    cy.siteLogin('admin');

    // Verify there are initially 131 canvases
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="canvas-count"]').should(
      'have.text',
      '131',
    );

    // Delete canvas
    cy.visit('/s/default/madoc/admin/manifests/2/canvases/4/delete');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Delete canvas').should('be.enabled');
    cy.react('Button').contains('Delete canvas').click();
    cy.waitForReact(1000, '.react-loaded');

    // Verify there are now 130 canvases
    cy.get('[data-cy="canvas-count"]').should(
      'have.text',
      '130',
    );
  });
});