/// <reference types="../../types" />
before(() => {
  cy.loadSite('empty-site-users', true);
});

beforeEach(() => {
  cy.loadSite('empty-site-users');
  cy.visit('/logout');
});

it('should be able to see the outputs of simple textual annotations', () => {
  // 1. Transcriber makes annotation
  cy.siteLogin('Transcriber');
  cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/12/model');
  cy.waitForReact(1000, '.react-loaded');
  cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
  cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

  cy.react('TextField', { props: { label: 'description' } }).type('An example value');
  cy.react('Button').contains('Submit').click();
  cy.get('[data-cy="publish-button"]').click();
  cy.get('[data-cy="publish-button"]').should('be.disabled');
  cy.get('[data-cy="close-add-another"]').should('exist');

  // 2. Reviewer approves
  cy.siteLogin('admin');
  cy.visit('/s/default/madoc/projects/project-with-model');
  cy.waitForReact(1000, '.react-loaded');
  cy.get('[data-cy="task-name"] a')
    .contains('Review of "User contributions to "Forth Bridge illustrations 1886-1887 - 9""')
    .click();

  cy.react('KanbanCardButton').contains('Review contribution').click();
  cy.react('ApproveSubmission').click(); // open modal
  cy.get('[data-cy="approve-submission"]').click(); // confirmation
  cy.get('[data-cy="kanban-completed-reviews"]').react('KanbanCard').should('have.length', 1);

  // 3. See the annotation
  cy.siteLogin('Viewer');
  cy.visit('/s/default/madoc/projects/project-with-model/manifests/2/c/12');
  cy.waitForReact(1000, '.react-loaded');
  cy.react('DocumentValueWrapper').contains('An example value');
});

it('should be able to see the outputs of annotations with selectors', () => {
  // 1. Transcriber makes annotation
  cy.siteLogin('Transcriber');
  cy.visit('/s/default/madoc/projects/project-with-choice/manifests/2/c/13/model');
  cy.waitForReact(1000, '.react-loaded');
  cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
  cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

  cy.get('label').contains('Choice B').click();
  cy.react('TextField', { props: { label: 'Field B' } }).type('An example value with selector');
  cy.react('FieldInstance', { props: { property: 'field-b' } })
    .get('div')
    .contains('Define region')
    .click();

  // Fill in the selected region
  cy.get('button').contains('define region').click();

  cy.react('Atlas')
    .get('canvas')
    .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
    .trigger('mousedown', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
    .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 300, y: 150 })
    .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 350, y: 200 })
    .trigger('mouseup');

  // Submit
  cy.react('Button').contains('Submit').click();
  cy.get('[data-cy="publish-button"]').click();
  cy.get('[data-cy="publish-button"]').should('be.disabled');
  cy.get('[data-cy="close-add-another"]').should('exist');

  // 2. Reviewer approves
  cy.siteLogin('admin');
  cy.visit('/s/default/madoc/projects/project-with-choice');
  cy.waitForReact(1000, '.react-loaded');
  cy.get('[data-cy="task-name"] a')
    .contains('Review of "User contributions to "Forth Bridge illustrations 1886-1887 - 10""')
    .click();

  cy.react('KanbanCardButton').contains('Review contribution').click();
  cy.react('ApproveSubmission').click(); // open modal
  cy.get('[data-cy="approve-submission"]').click(); // confirmation
  cy.get('[data-cy="kanban-completed-reviews"]').react('KanbanCard').should('have.length', 1);

  // 3. See the annotation
  cy.siteLogin('Viewer');
  cy.visit('/s/default/madoc/projects/project-with-choice/manifests/2/c/13');
  cy.waitForReact(1000, '.react-loaded');
  cy.react('DocumentValueWrapper').contains('An example value with selector');
});
