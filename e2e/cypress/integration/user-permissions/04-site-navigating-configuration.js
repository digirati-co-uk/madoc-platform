it('Should load homepage', () => {
  cy.loadSite('empty-site-users');
  cy.siteLogin('Transcriber');
  cy.visit('/s/default/madoc');

  cy.get('h1').should('contain', 'Welcome back Transcriber');

  cy.waitForReact(1000, '.react-loaded');

  cy.react('Heading1').should('contain', 'Welcome back Transcriber');
  cy.react('ProjectListingTitle').should('have.length', '4');
});
