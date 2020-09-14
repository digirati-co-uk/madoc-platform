before(() => {
  Cypress.Cookies.defaults({
    preserve: (cookie) => {
      return true;
    }
  })
  cy.visit('/logout');
  cy.visit('/login');
  cy.get('#email').click();
  cy.get('#email').type('admin@example.org');
  cy.get('#password').type('Testpass123_');
  cy.get('input[type="submit"]').click();
})


it('Can login', () => {
  cy.visit('/admin');
  cy.contains('Admin dashboard');
})
