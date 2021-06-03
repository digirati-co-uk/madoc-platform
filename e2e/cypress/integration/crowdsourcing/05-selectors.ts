/// <reference types="../../types" />
describe('Empty site users', () => {
  beforeEach(() => {
    cy.loadSite('empty-site-users', true);
  });

  // "fields": [
  //   [
  //     "entity",
  //     [
  //       "test"
  //     ]
  //   ],
  //   [
  //     "entity-multiple",
  //     [
  //       "name"
  //     ]
  //   ],
  //   "field-multiple",
  //   "field"
  // ]

  it('Saving single field selector', () => {
    cy.siteLogin('Transcriber');
    cy.visit('/s/default/madoc/projects/project-with-selectors/manifests/2/c/4/model');

    cy.server();
    cy.intercept('POST', '/api/crowdsourcing/model/*/revision').as('revision');

    cy.waitForReact(1000, '.react-loaded');
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    // cy.get('label').contains('Choice B').click();
    cy.react('TextField', { props: { label: 'Field' } }).type('An example value with selector');
    cy.react('FieldInstance', { props: { property: 'field-single' } })
      .contains('Define region')
      .click();

    cy.react('Atlas')
      .get('canvas')
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
      .trigger('mousedown', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 300, y: 150 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 350, y: 200 })
      .trigger('mouseup');

    cy.wait(1500);

    cy.react('FieldInstance', { props: { property: 'field-single' } })
      .contains('Define region')
      .click();

    // // Submit
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="save-later-button"]').click();

    cy.get('@revision').its('request.body.document.properties.field-single.0.selector.state.x').should('equal', 69);
    cy.get('@revision').its('request.body.document.properties.field-single.0.selector.state.y').should('equal', 148);
    cy.get('@revision')
      .its('request.body.document.properties.field-single.0.selector.state.width')
      .should('equal', 742);
    cy.get('@revision')
      .its('request.body.document.properties.field-single.0.selector.state.height')
      .should('equal', 445);

    // cy.get('[data-cy="close-add-another"]').should('exist');
  });

  it('Saving single entity selector', () => {
    cy.siteLogin('Transcriber');
    cy.visit('/s/default/madoc/projects/project-with-selectors/manifests/2/c/5/model');

    cy.server();
    cy.intercept('POST', '/api/crowdsourcing/model/*/revision').as('revision');

    cy.waitForReact(1000, '.react-loaded');
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    cy.react('DefaultInlineEntity', { props: { property: 'entity-single' } }).click();

    cy.get('button').contains('define region').click();

    cy.react('Atlas')
      .get('canvas')
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
      .trigger('mousedown', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 300, y: 150 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 350, y: 200 })
      .trigger('mouseup');

    cy.wait(1500);

    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="save-later-button"]').click();

    cy.get('@revision')
      .its('request.body.document.properties.entity-single.0.selector.revisedBy.0.state.x')
      .should('equal', 69);
    cy.get('@revision')
      .its('request.body.document.properties.entity-single.0.selector.revisedBy.0.state.y')
      .should('equal', 149);
    cy.get('@revision')
      .its('request.body.document.properties.entity-single.0.selector.revisedBy.0.state.width')
      .should('equal', 741);
    cy.get('@revision')
      .its('request.body.document.properties.entity-single.0.selector.revisedBy.0.state.height')
      .should('equal', 445);
  });

  it.only('Saving multiple entity selectors', () => {
    cy.siteLogin('Transcriber');
    cy.visit('/s/default/madoc/projects/project-with-selectors/manifests/2/c/6/model');

    cy.server();
    cy.intercept('POST', '/api/crowdsourcing/model/*/revision').as('revision');

    cy.waitForReact(1000, '.react-loaded');
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    cy.react('DefaultInlineEntity', { props: { property: 'entity-multiple' } }).click();

    // Entity 1.
    cy.react('TextField', { props: { label: 'name' } }).type('entity 1');
    cy.get('button').contains('define region').click();

    cy.react('Atlas')
      .get('canvas')
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
      .trigger('mousedown', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 100, y: 50 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 300, y: 150 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 350, y: 200 })
      .trigger('mouseup');

    cy.react('BreadcrumbItem').contains('Back').click();
    cy.react('NewInstanceContainer').contains('Add another Entity multiple').click();

    // Entity 2.
    cy.react('DefaultInlineEntity', { props: { property: 'entity-multiple' } })
      .nthNode(1)
      .click();
    cy.react('TextField', { props: { label: 'name' } }).type('entity 2');
    cy.get('button').contains('define region').click();

    cy.react('Atlas')
      .get('canvas')
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 600, y: 50 })
      .trigger('mousedown', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 600, y: 50 })
      .trigger('mousemove', { eventConstructor: 'MouseEvent', button: 0, position: 'topLeft', x: 850, y: 200 })
      .trigger('mouseup');

    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="save-later-button"]').click();

    const root = `request.body.document.properties.entity-multiple`;

    cy.get('@revision').its(`${root}.0.selector.revisedBy.0.state.x`).should('equal', 78);
    cy.get('@revision').its(`${root}.0.selector.revisedBy.0.state.y`).should('equal', 147);
    cy.get('@revision').its(`${root}.0.selector.revisedBy.0.state.width`).should('equal', 736);
    cy.get('@revision').its(`${root}.0.selector.revisedBy.0.state.height`).should('equal', 442);
    cy.get('@revision').its(`${root}.1.selector.state.x`).should('equal', 1550);
    cy.get('@revision').its(`${root}.1.selector.state.y`).should('equal', 147);
    cy.get('@revision').its(`${root}.1.selector.state.width`).should('equal', 736);
    cy.get('@revision').its(`${root}.1.selector.state.height`).should('equal', 442);
  });

  it('Saving multiple field selectors', () => {});
});
