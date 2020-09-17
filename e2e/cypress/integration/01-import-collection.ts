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
it('can import collection', () => {
  cy.visit('/s/default/madoc/admin/collections');
  cy.get('a').contains('Import collection').click();
  cy.get('input[name="collection_url"]').click();
  cy.get('input[name="collection_url"]').type('https://view.nls.uk/collections/7446/74466699.json');
  cy.get('button').contains('Import').click();
  // Preview
  // cy.get('button').contains('preview', { timeout: 20000 }).click();
  // cy.get('img').first().then(e => {
  //   expect(e.attr('src')).to.equal('https://view.nls.uk/iiif/7443/74438561.5/full/256,/0/default.jpg');
  // });
  cy.wait(5000);
  // Import
  cy.get('button').contains('Import collection and 2 manifests').click();
  cy.get('div').contains('All sub-tasks have been completed.', {
    timeout: 200000,
  });

  // Check.
  cy.get('a').contains('view collection').click();
  cy.get('h5').contains('Forth Bridge illustrations 1886-1887');
  cy.get('h5').contains('Tay Bridge enquiry');
})

