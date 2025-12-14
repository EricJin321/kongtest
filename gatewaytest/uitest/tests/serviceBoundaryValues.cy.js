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
    fillInput(SERVICE_SELECTORS.URL_INPUT, mockServerUrl);
    fillInput(SERVICE_SELECTORS.NAME_INPUT, serviceName);
    
    // Expand advanced fields
    expandCollapseSection(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT, 'View advanced fields');
    
    // Set retries to minimum (0) and all timeout values to 1ms
    fillInput(SERVICE_SELECTORS.RETRIES_INPUT, '0');
    fillInput(SERVICE_SELECTORS.CONN_TIMEOUT_INPUT, '1');
    fillInput(SERVICE_SELECTORS.WRITE_TIMEOUT_INPUT, '1');
    fillInput(SERVICE_SELECTORS.READ_TIMEOUT_INPUT, '1');
    
    // Submit form
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON);
    
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
    const mockServerHttpsUrl = Cypress.env('mockServerHttps');
    
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
    
    // Fill basic fields with HTTPS URL
    fillInput(SERVICE_SELECTORS.URL_INPUT, mockServerHttpsUrl);
    fillInput(SERVICE_SELECTORS.NAME_INPUT, serviceName);
    
    // Expand advanced fields
    expandCollapseSection(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT, 'View advanced fields');
    
    // Set retries to maximum (32767) and all timeout values to 2147483646ms
    fillInput(SERVICE_SELECTORS.RETRIES_INPUT, '32767');
    fillInput(SERVICE_SELECTORS.CONN_TIMEOUT_INPUT, maxTimeout);
    fillInput(SERVICE_SELECTORS.WRITE_TIMEOUT_INPUT, maxTimeout);
    fillInput(SERVICE_SELECTORS.READ_TIMEOUT_INPUT, maxTimeout);
    
    // Fill CA certificates with multiple UUIDs (comma-separated)
    fillInput(SERVICE_SELECTORS.CA_CERTS_INPUT, 'a3f4c2e1-8b6d-4d9a-9f5a-1e7c2d8a4b91,6f9d8c7b-2a1e-4f3d-b0c6-9e5a1d2f8c34');
    
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
