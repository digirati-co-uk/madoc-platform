/// <reference types="../../types" />

describe('Delete project', () => {
  before(() => {
    cy.loadSite('empty-site-users', true);
  });

  it('Admins should be able to delete projects', () => {
    cy.siteLogin('admin');

    // Verify there are initially 6 projects, 2 collections, 2 manifests, and 131 canvases
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="project-count"]').should(
      'have.text',
      '6',
    );
    cy.get('[data-cy="collection-count"]').should(
      'have.text',
      '2',
    );
    cy.get('[data-cy="manifest-count"]').should(
      'have.text',
      '2',
    );
    cy.get('[data-cy="canvas-count"]').should(
      'have.text',
      '131',
    );

    // Delete manifest
    cy.visit('/s/default/madoc/admin/projects/6/delete');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Delete Project').should('be.enabled');
    cy.react('Button').contains('Delete Project').click();
    cy.waitForReact(1000, '.react-loaded');

    // TODO is this long enough?
    cy.wait(10000);

    // Verify there are now 5 projects, and no collections, manifests, or canvases have been removed
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="project-count"]').should(
      'have.text',
      '5',
    );
    cy.get('[data-cy="collection-count"]').should(
      'have.text',
      '2',
    );
    cy.get('[data-cy="manifest-count"]').should(
      'have.text',
      '2',
    );
    cy.get('[data-cy="canvas-count"]').should(
      'have.text',
      '131',
    );
  });
});