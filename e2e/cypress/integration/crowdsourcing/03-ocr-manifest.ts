/// <reference types="../../types" />

describe('OCR manifest', () => {
  before(() => {
    cy.loadSite('wunder-ocr', true);
  });

  beforeEach(() => {
    cy.loadSite('wunder-ocr');
    cy.visit('/logout');
  });

  it('should be able to see the site', () => {
    // 1. Transcriber makes annotation
    cy.siteLogin('admin');
    cy.visit('/s/wunder-ocr/madoc/projects/ocr-correction/manifests/147/c/163/model');
    cy.waitForReact(1000, '.react-loaded');
  });
});
