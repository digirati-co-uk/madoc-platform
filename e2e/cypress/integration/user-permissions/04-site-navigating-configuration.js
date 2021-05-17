describe('Site navigation configuration', () => {
  it('Should load homepage', () => {
    cy.loadSite('empty-site-users');
    cy.siteLogin('Transcriber');
    cy.visit('/s/default/madoc/dashboard');

    cy.get('h2').should('contain', 'Welcome back Transcriber');

    cy.waitForReact(1000, '.react-loaded');

    cy.react('Heading2').should('contain', 'Welcome back Transcriber');
    cy.react('ProjectListingTitle').should('have.length', '4');
  });
});
