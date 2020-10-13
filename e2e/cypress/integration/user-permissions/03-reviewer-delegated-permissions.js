it('Reviewer can see all review tasks', { defaultCommandTimeout: 200 }, () => {
  cy.loadSite('empty-site-users');
  cy.apiRequest('Reviewer', {
    url: '/api/tasks/333f35eb-a68c-4f37-9409-680e5f058e0d',
  })
    .its('body')
    .should((resp) => {
      expect(resp.assignee.id).to.equal('urn:madoc:user:2'); // Can access it even though they are not assigned.
    });

  cy.apiRequest('Reviewer', {
    url: '/api/tasks/c647fc79-6a20-4d11-95a0-df8d3135dc20',
  })
    .its('body')
    .should((resp) => {
      expect(resp.assignee.id).to.equal('urn:madoc:user:3'); // Can access it even though they are not assigned.
    });
});
