describe('01 Capture model permissions', () => {
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

  // Permissions - extended.

  it('Viewer cannot see revisions', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('Viewer', {
      url: '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2',
    })
      .its('body')
      .should((resp) => {
        expect(resp.revisions).to.have.length(0);
      });
  });

  it('Contributor can only see their revision', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('Transcriber', {
      url: '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.revisions).to.have.length(2);
      });
  });

  it('Reviewer can only see all revisions', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('Reviewer', {
      url: '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.revisions).to.have.length(6);
      });
  });

  it('Admin can only see all revisions', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('admin', {
      url: '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.revisions).to.have.length(6);
      });
  });

  it('Admin should be able to see canonical properties', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('admin', {
      url: '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.document.properties.description).to.have.length(7);
      });
  });

  it('Contributor should be able to see canonical properties', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('Transcriber', {
      url: '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.document.properties.description).to.have.length(3);
      });
  });

  it('Admin should be able to see single revision', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('admin', {
      url:
        '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2?revisionId=d0b4d32c-9982-4c65-9b98-c3e751ff3566',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.document.properties.description).to.have.length(2);
      });
  });

  it('Contributor should not be able to see another users revision', { defaultCommandTimeout: 200 }, () => {
    cy.loadSite('empty-site-users');
    cy.apiRequest('Transcriber', {
      url:
        '/api/crowdsourcing/model/90910e6f-ef13-4877-a297-e9f5e9c2bbf2?revisionId=d0b4d32c-9982-4c65-9b98-c3e751ff3566',
    })
      .its('body')
      .should((resp) => {
        expect(resp.document.properties).to.have.property('description');
        expect(resp.document.properties.description).to.have.length(1);
        expect(resp.revisions.map((r) => r.id)).not.to.contain('d0b4d32c-9982-4c65-9b98-c3e751ff3566');
      });
  });
});
