it('Admin can see capture model', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('admin', {
    url: '/api/crowdsourcing/model/9cfeb2e1-1c8e-4984-b2e3-bfbc3aa7bfa6',
  })
    .its('body')
    .should((resp) => {
      expect(resp.document.properties).to.have.property('description');
    });
});

it('Transcriber can see capture model', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('Transcriber', {
    url: '/api/crowdsourcing/model/9cfeb2e1-1c8e-4984-b2e3-bfbc3aa7bfa6',
  })
    .its('body')
    .should((resp) => {
      expect(resp.document.properties).to.have.property('description');
    });
});

it('Reviewer can see capture model', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('Reviewer', {
    url: '/api/crowdsourcing/model/9cfeb2e1-1c8e-4984-b2e3-bfbc3aa7bfa6',
  })
    .its('body')
    .should((resp) => {
      expect(resp.document.properties).to.have.property('description');
    });
});

it('Limited reviewer can see capture model', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('Limited reviewer', {
    url: '/api/crowdsourcing/model/9cfeb2e1-1c8e-4984-b2e3-bfbc3aa7bfa6',
  })
    .its('body')
    .should((resp) => {
      expect(resp.document.properties).to.have.property('description');
    });
});

it('Limited contributor can see capture model', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('Limited contributor', {
    url: '/api/crowdsourcing/model/9cfeb2e1-1c8e-4984-b2e3-bfbc3aa7bfa6',
  })
    .its('body')
    .should((resp) => {
      expect(resp.document.properties).to.have.property('description');
    });
});

it('Viewer can see capture model (only published)', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('Viewer', {
    url: '/api/crowdsourcing/model/9cfeb2e1-1c8e-4984-b2e3-bfbc3aa7bfa6',
  })
    .its('body')
    .should((resp) => {
      expect(resp.document.properties).to.have.property('description');
    });
});
