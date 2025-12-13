/**
 * @fileoverview Kong Manager UI navigation tests
 * @description Tests navigation flows between different pages in Kong Manager,
 * including sidebar navigation and page redirects after creating services/routes.
 */

import { fillInput, clickWhenEnabled, clickSidebarItem } from '../../utils/uiHelpers.js';
import { SERVICE_SELECTORS, ROUTE_SELECTORS, URL_PATHS, URL_PATTERNS } from '../../utils/constants.js';
import KongManager from '../../utils/kongManager.js';

describe('Sidebar Navigation Verification', () => {
  after(() => {
    // Clean up the service created in the test
    KongManager.deleteService('JumpTestService');
  });

  it('should navigate to Gateway Services and Routes pages', () => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.OVERVIEW}`);

    // Click Gateway Services
    clickSidebarItem('Gateway Services');
    cy.url().should('eq', `${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES}`);

    // Click Routes
    clickSidebarItem('Routes');
    cy.url().should('eq', `${Cypress.env('kongManagerUrl')}${URL_PATHS.ROUTES}`);
  });

  it('should navigate to Create Service page and verify creation redirect', () => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES}`);

    // Use the same selector logic as KongManager.createService
    cy.get(SERVICE_SELECTORS.CREATE_SERVICE_BUTTON, { timeout: Cypress.env('pageLoadTimeout') })
      .should(($els) => {
        expect($els.filter(':visible').length).to.be.gt(0, 'Expected create service button to be visible');
      })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.url().should('include', URL_PATHS.SERVICES_CREATE);

    // Fill form and save
    fillInput(SERVICE_SELECTORS.URL_INPUT, Cypress.env('mockServerHttp'), { scroll: false });
    fillInput(SERVICE_SELECTORS.NAME_INPUT, 'JumpTestService', { scroll: false });
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });

    // Verify redirect to service detail (UUID pattern)
    cy.url({ timeout: Cypress.env('saveOperationTimeout') }).should('match', URL_PATTERNS.SERVICE_DETAIL_GUID);
  });

  it('should navigate to Create Route page from Routes list', () => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.ROUTES}`);

    cy.get(ROUTE_SELECTORS.EMPTY_STATE_ACTION)
      .first()
      .should('be.visible')
      .click();

    cy.url().should('include', URL_PATHS.ROUTES_CREATE);
  });
});
