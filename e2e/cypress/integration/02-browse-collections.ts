before(() => {
  Cypress.Cookies.defaults({
    preserve: (cookie) => {
      return true;
    }
  })
  cy.visit('/s/default/madoc/logout');
  cy.visit('/s/default/madoc/login');
  cy.get('#email').click();
  cy.get('#email').type('admin@example.org');
  cy.get('#password').type('Testpass123_');
  cy.get('input[type="submit"]').click();
})
it('can browse an imported collection', () => {
  cy.visit('/s/default/madoc/admin/collections');
  cy.get('a').contains('Scottish Bridges').click();

  cy.get('a').contains('manifests');
  cy.get('a').contains('edit metadata');
  cy.get('a').contains('edit structure');
  cy.get('a').contains('projects');
  cy.get('a').contains('delete');

  cy.get('img').first().click();
  cy.get('h1').contains('Forth Bridge illustrations 1886-1887');

  // Edit metadata
  cy.get('a').contains('edit metadata').click();

  cy.get('[id="metadata.0.label"]').then(r => expect(r.val()).to.equal('Title'));
  cy.get('[id="metadata.0.value"]').then(r => expect(r.val()).to.equal('Forth Bridge illustrations 1886-1887'));

  // Edit metadata.
  cy.get('[id="metadata.0.value"]').click();
  cy.get('[id="metadata.0.value"]').clear();
  cy.get('[id="metadata.0.value"]').type('Testing');

  cy.get('button').contains('Save changes').click();
  cy.wait(200);
  cy.get('a').contains('edit metadata').click();
  cy.wait(400);
  cy.get('[id="metadata.0.value"]').then(r => expect(r.val()).to.equal('Testing'));

  // revert the changes.
  cy.get('[id="metadata.0.value"]').click();
  cy.get('[id="metadata.0.value"]').clear();
  cy.get('[id="metadata.0.value"]').type('Forth Bridge illustrations 1886-1887');

  cy.get('button').contains('Save changes').click();
})

