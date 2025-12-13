/**
 * @fileoverview Service creation boundary value tests
 * @description Tests service creation with boundary values and special characters,
 * including extreme timeout values and valid special characters in names.
 */

import { fillInput, clickWhenEnabled, expandCollapseSection } from '../../utils/uiHelpers.js';
import { SERVICE_SELECTORS, URL_PATHS, TIMEOUTS } from '../../utils/constants.js';
import KongManager from '../../utils/kongManager.js';

describe('Service Creation with Boundary Values', () => {
  const mockServerUrl = Cypress.env('mockServerHttp');

  afterEach(() => {
    // Clean up created services
    cy.url().then((url) => {
      if (url.includes('/services/') && !url.includes('/create')) {
        // Extract service ID from URL to construct service name
        const match = url.match(/\/services\/([^\/]+)$/);
        if (match && match[1]) {
          cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES}`);
          // Delete by the actual service name from the test
          const currentTest = Cypress.currentTest.title;
          if (currentTest.includes('minimum')) {
            KongManager.deleteService('Boundary_Service-1');
          } else if (currentTest.includes('maximum')) {
            KongManager.deleteService('Boundary_Service~1');
          }
        }
      }
    });
  });

  it('should create service with minimum timeout values (1ms)', () => {
    const serviceName = 'Boundary_Service-1';
    
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
    
    // Fill basic fields
    fillInput(SERVICE_SELECTORS.URL_INPUT, mockServerUrl, { scroll: false });
    fillInput(SERVICE_SELECTORS.NAME_INPUT, serviceName, { scroll: false });
    
    // Expand advanced fields
    expandCollapseSection(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT, 'View advanced fields');
    
    // Set all timeout values to 1ms
    fillInput(SERVICE_SELECTORS.CONN_TIMEOUT_INPUT, '1', { scroll: true });
    fillInput(SERVICE_SELECTORS.WRITE_TIMEOUT_INPUT, '1', { scroll: true });
    fillInput(SERVICE_SELECTORS.READ_TIMEOUT_INPUT, '1', { scroll: true });
    
    // Submit form
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify redirect to service detail page
    cy.url({ timeout: Cypress.env('saveOperationTimeout') })
      .should('include', '/services/')
      .should('not.include', '/create');
    
    // Verify service was created
    cy.get('h1, .page-header').should('contain', serviceName);
  });

  it('should create service with maximum timeout values (2147483646ms)', () => {
    const serviceName = 'Boundary_Service~1';
    const maxTimeout = '2147483646';
    
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
    
    // Fill basic fields
    fillInput(SERVICE_SELECTORS.URL_INPUT, mockServerUrl, { scroll: false });
    fillInput(SERVICE_SELECTORS.NAME_INPUT, serviceName, { scroll: false });
    
    // Expand advanced fields
    expandCollapseSection(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT, 'View advanced fields');
    
    // Set all timeout values to 2147483646ms
    fillInput(SERVICE_SELECTORS.CONN_TIMEOUT_INPUT, maxTimeout, { scroll: true });
    fillInput(SERVICE_SELECTORS.WRITE_TIMEOUT_INPUT, maxTimeout, { scroll: true });
    fillInput(SERVICE_SELECTORS.READ_TIMEOUT_INPUT, maxTimeout, { scroll: true });
    
    // Submit form
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify redirect to service detail page
    cy.url({ timeout: Cypress.env('saveOperationTimeout') })
      .should('include', '/services/')
      .should('not.include', '/create');
    
    // Verify service was created
    cy.get('h1, .page-header').should('contain', serviceName);
  });
});
