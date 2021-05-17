/// <reference types="../../types" />
describe('Empty site users', () => {
  it('Models should show message when preparing for a transcriber', () => {
    cy.loadSite('empty-site-users', true);
  });
});
