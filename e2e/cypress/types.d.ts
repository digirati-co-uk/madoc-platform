// reference code is written like below to avoid the clash in mocha types.
// in most of the cases, simple <reference types="cypress" /> will do.
/// <reference types="cypress" />
/// <reference types="cypress-react-selector" />
/// <reference types="cypress-wait-until" />

declare namespace Cypress {
  // add custom Cypress command to the interface Chainable<Subject>
  interface Chainable<Subject = any> {
    // let TS know we have a custom command cy.clickLink(...)
    clickLink(label: string | number | RegExp): void;
    loadSite(name: string, clean?: boolean): void;
    siteLogin(name: 'Transcriber' | 'Viewer' | 'Limited reviewer' | 'Limited contributor' | 'admin' | string): void;
    preserveCookies(): void;
    apiRequest(siteName: string, request: RequestBody);
  }

  // add properties the application adds to its "window" object
  // by adding them to the interface ApplicationWindow
  interface ApplicationWindow {
    // let TS know the application's code will add
    // method window.add with the following signature
    add(a: number, b: number): number;
  }
}
