/// <reference types="../../types" />

describe('Delete project', () => {
  before(() => {
    cy.loadSite('empty-site-users', true);
  });

  it('Admins should be able to delete projects', () => {
    cy.siteLogin('admin');

    // Verify there are initially 6 projects
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="project-count"]').should(
      'have.text',
      '6',
    );

    // Delete manifest
    cy.visit('/s/default/madoc/admin/projects/3/delete');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Delete Project').should('be.enabled');
    cy.react('Button').contains('Delete Project').click();
    cy.waitForReact(1000, '.react-loaded');

    // TODO is this long enough?
    cy.wait(10000);

    // Verify there are now 5 projects
    cy.visit('/s/default/madoc/admin');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-cy="project-count"]').should(
      'have.text',
      '5',
    );
  });
});