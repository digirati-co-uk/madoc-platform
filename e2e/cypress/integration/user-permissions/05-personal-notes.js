describe('Personal notes', () => {
  it('Should load homepage', () => {
    cy.loadSite('empty-site-users');
    cy.siteLogin('Transcriber');

    // Go to image, make note.
    cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/24');
    cy.waitForReact(1000, '.react-loaded');
    cy.get('[data-tip="Personal notes"]').click(); // Document tab.

    const time = Date.now();

    cy.get('[data-cy="personal-notes"]').clear().type(`Testing a personal note ${time}`);
    cy.get('button').contains('Save').click();
    cy.wait(500);
    cy.get('[data-cy="personal-notes"]').contains(`Testing a personal note ${time}`);

    // Check next image, make sure no note.
    cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/25');
    cy.get('[data-tip="Personal notes"]').click(); // Document tab.
    cy.get('[data-cy="personal-notes"]').should('have.value', '');

    // Login as different user + make sure no note.
    cy.siteLogin('admin');
    cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/24');
    cy.get('[data-tip="Personal notes"]').click(); // Document tab.
    cy.get('[data-cy="personal-notes"]').should('have.value', '');
  });
});
