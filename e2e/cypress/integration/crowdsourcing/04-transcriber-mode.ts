/// <reference types="../../types" />
describe('Empty site users', () => {
  beforeEach(() => {
    cy.loadSite('transcriber-mode', true);
  });

  it('Visitors can navigate project', () => {
    cy.loadSite('transcriber-mode');

    cy.visit('/s/transcriber-mode/madoc/projects');
    cy.waitForReact(1000, '.react-loaded');

    cy.react('ProjectContainer');
    cy.react('Button').contains('Go to project').click();

    // Select manifest
    cy.get('[title="00001"]').click();

    // Select canvas
    cy.get('[title="FelixArchief_V92_003"]').click();

    // Open metadata
    cy.get('[data-tip="Metadata"]').click(); // Metadata tab.

    cy.get('span').contains('ondervragingen en getuigenverslagen');
  });

  it('Transcriber happy path', () => {
    cy.loadSite('transcriber-mode');

    // Transcriber.
    cy.siteLogin('Transcriber');
    cy.visit('/s/transcriber-mode/madoc/projects');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Go to project').click();

    // Go to first manifest.
    cy.get('[title="00001"]').click();
    cy.get('[title="FelixArchief_V92_003"]').click();
    cy.waitFor('a:contains("Contribute")');

    cy.get('a:contains("Contribute")').click();
    cy.waitForReact(1000, '.react-loaded');

    // Transcription process, all submitted.
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);
    cy.react('TextField', { props: { label: 'Transcription' } }).type('Transcription for 1');
    cy.react('Button').contains('Save').click();
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="modal"]').find('button').contains('Submit').click();
    // After finishing, what do we expect?
    // 1. Task is complete message.
    cy.contains('Task is complete!');
    cy.react('Button', { props: { children: 'Submitted', $success: true } }).should('be.disabled');
    cy.react('Button', { props: { 'data-cy': 'workflow-bar-unusable' } }).should('be.disabled');
    // Go to next image.
    cy.get('[title="Go to next image"]').click();

    // Image 2.
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);
    cy.react('TextField', { props: { label: 'Transcription' } }).type('Transcription for 2');
    cy.react('Button').contains('Save').click();
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="modal"]').find('button').contains('Submit').click();
    // After finishing, what do we expect?
    // 1. Task is complete message.
    cy.contains('Task is complete!');
    cy.contains('Thank you. You finished this manifest. Go back to the project to find a new manifest to transcribe.');

    // 2. Manifest page says ready for review.
    cy.get('a').contains('00001').click();
    cy.contains('This manifest is currently in review');

    // 3. Project manifests should not contain this manifest.
    cy.get('a').contains('Transcription project').click();
    cy.get('[title="00001"]').should('not.exist');
  });

  it('Transcriber marking all as too unusable', () => {
    cy.loadSite('transcriber-mode');

    // Transcriber.
    cy.siteLogin('Transcriber');
    cy.visit('/s/transcriber-mode/madoc/projects');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Go to project').click();

    // Go to first manifest.
    cy.get('[title="00002"]').click();
    cy.get('[title="FelixArchief_V92_016"]').click();
    cy.waitFor('a:contains("Contribute")');

    cy.get('a:contains("Contribute")').click();
    cy.waitForReact(1000, '.react-loaded');

    // Transcription process, all submitted.
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    // We are clicking unusable on all of them
    cy.react('Button', { props: { 'data-cy': 'workflow-bar-unusable' } }).click();
    cy.contains('Task is complete!');
    cy.react('Button', { props: { 'data-cy': 'workflow-bar-unusable' } }).should('not.be.disabled');
    // Go to next image.
    cy.get('[title="Go to next image"]').click();

    // Transcription process, all submitted.
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    // We are clicking unusable on all of them
    cy.react('Button', { props: { 'data-cy': 'workflow-bar-unusable' } }).click();
    cy.contains('Task is complete!');

    // Completed the whole manifest.
    cy.contains('Thank you. You finished this manifest. Go back to the project to find a new manifest to transcribe.');

    // 2. Manifest page says ready for review.
    cy.get('a').contains('00002').click();
    cy.contains('This manifest is currently in review');

    // 3. Project manifests should not contain this manifest.
    cy.get('a').contains('Transcription project').click();
    cy.get('[title="00002"]').should('not.exist');
  });

  it.only('Transcriber submitting 1, marking one as unusable and then marking as too difficult', () => {
    cy.loadSite('transcriber-mode');

    // Transcriber.
    cy.siteLogin('Transcriber');
    cy.visit('/s/transcriber-mode/madoc/projects');
    cy.waitForReact(1000, '.react-loaded');
    cy.react('Button').contains('Go to project').click();

    // Manifest with more than 2 items.
    cy.get('[title="00004"]').click();
    cy.get('[title="FelixArchief_V92_020b"]').click();

    cy.waitFor('a:contains("Contribute")');

    cy.get('a:contains("Contribute")').click();
    cy.waitForReact(1000, '.react-loaded');

    // Transcription process, all submitted.
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    // 1st image, submit as normal.
    cy.react('TextField', { props: { label: 'Transcription' } }).type('Transcription for 1');
    cy.react('Button').contains('Save').click();
    cy.react('Button').contains('Submit').click();
    cy.get('[data-cy="modal"]').find('button').contains('Submit').click();
    // After finishing, what do we expect?
    // 1. Task is complete message.
    cy.contains('Task is complete!');
    cy.react('Button', { props: { children: 'Submitted', $success: true } }).should('be.disabled');
    cy.react('Button', { props: { 'data-cy': 'workflow-bar-unusable' } }).should('be.disabled');
    // Go to next image.
    cy.get('[title="Go to next image"]').click();

    // 2nd image, mark as unusable.
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 1);
    cy.waitUntil(() => Cypress.$('[data-cy="info-message"]').length === 0);

    // We are clicking unusable on all of them
    cy.react('Button', { props: { 'data-cy': 'workflow-bar-unusable' } }).click();
    cy.contains('Task is complete!');
    cy.get('[title="Go to next image"]').click();

    // 3rd image, mark as too difficult.

    cy.get('[data-cy="workflow-bar-difficult"]').click();
    cy.contains('Mark as too difficult').click();

    // Back on the project page.
    cy.contains('Transcription project');
    cy.get('[title="00004"]').should('exist');
    cy.get('Continue submission').should('not.exist');
  });
});
