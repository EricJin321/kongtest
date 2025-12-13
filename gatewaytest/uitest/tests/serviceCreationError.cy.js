/**
 * @fileoverview Service creation error handling tests
 * @description Tests validation and error messages for invalid service configurations
 * in Kong Manager UI, including URL format, naming constraints, and timeout values.
 */

import { fillInput, clickWhenEnabled } from '../../utils/uiHelpers.js';
import { SERVICE_CREATION_ERRORS } from '../utils/errorCode.js';
import { SERVICE_SELECTORS, URL_PATHS } from '../../utils/constants.js';
import KongManager from '../../utils/kongManager.js';

describe('Service Creation Error Handling', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
  });

  it('should show error for invalid Full URL (file://)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'file://abc', { scroll: false });
    // Verify the error message text ignoring dynamic data-v attributes
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_URL)
      .should('be.visible');
    
    // Clear input as requested
    cy.get(SERVICE_SELECTORS.URL_INPUT).clear();
  });

  it('should show error for invalid Name (MyService$$)', () => {
    fillInput(SERVICE_SELECTORS.NAME_INPUT, 'MyService$$', { scroll: true });
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_NAME)
      .should('be.visible');

    // Clear input as requested
    cy.get(SERVICE_SELECTORS.NAME_INPUT).clear();
  });

  it('should show error for invalid Connection Timeout (0)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Connection Timeout with 0
    fillInput(SERVICE_SELECTORS.CONN_TIMEOUT_INPUT, '0', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify error message (it appears in a toast/alert list, not help-text)
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_CONN_TIMEOUT).should('be.visible');
  });
});

describe('Duplicate Service Name Test', () => {
  const serviceName = 'repeatTest';
  const serviceUrl = Cypress.env('mockServerHttp');

  before(() => {
    // Create the initial service that we will try to duplicate
    return KongManager.createService(serviceUrl, { name: serviceName });
  });

  after(() => {
    // Clean up the service
    return KongManager.deleteService(serviceName);
  });

  beforeEach(() => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
  });

  it('should fail when creating a service with an existing name', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, Cypress.env('mockServerHttp'), { scroll: false });
    fillInput(SERVICE_SELECTORS.NAME_INPUT, serviceName, { scroll: false });
    
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify unique constraint error
    cy.contains(SERVICE_CREATION_ERRORS.UNIQUE_CONSTRAINT(serviceName)).should('be.visible');
  });
});
