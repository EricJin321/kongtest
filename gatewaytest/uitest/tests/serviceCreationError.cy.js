import { fillInput, clickWhenEnabled } from '../../utils/uiHelpers.js';
import { SERVICE_CREATION_ERRORS } from '../utils/errorCode.js';
import KongManager from '../../utils/kongManager.js';

describe('Service Creation Error Handling', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8002/default/services/create');
  });

  it('should show error for invalid Full URL (file://)', () => {
    fillInput('[data-testid="gateway-service-url-input"]', 'file://abc', { scroll: false });
    // Verify the error message text ignoring dynamic data-v attributes
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_URL)
      .should('be.visible');
    
    // Clear input as requested
    cy.get('[data-testid="gateway-service-url-input"]').clear();
  });

  it('should show error for invalid Name (MyService$$)', () => {
    fillInput('[data-testid="gateway-service-name-input"]', 'MyService$$', { scroll: true });
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_NAME)
      .should('be.visible');

    // Clear input as requested
    cy.get('[data-testid="gateway-service-name-input"]').clear();
  });

  it('should show error for invalid Connection Timeout (0)', () => {
    fillInput('[data-testid="gateway-service-url-input"]', 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get('[data-testid="collapse-trigger-label"]')
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Connection Timeout with 0
    fillInput('[data-testid="gateway-service-connTimeout-input"]', '0', { scroll: true });
    
    // Click Save
    clickWhenEnabled('[data-testid="service-create-form-submit"]', { force: false });
    
    // Verify error message (it appears in a toast/alert list, not help-text)
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_CONN_TIMEOUT).should('be.visible');
  });
});

describe('Duplicate Service Name Test', () => {
  const serviceName = 'repeatTest';
  const serviceUrl = 'http://mockserver:1080';

  before(() => {
    // Create the initial service that we will try to duplicate
    return KongManager.createService(serviceUrl, { name: serviceName });
  });

  after(() => {
    // Clean up the service
    return KongManager.deleteService(serviceName);
  });

  beforeEach(() => {
    cy.visit('http://localhost:8002/default/services/create');
  });

  it('should fail when creating a service with an existing name', () => {
    fillInput('[data-testid="gateway-service-url-input"]', serviceUrl, { scroll: false });
    fillInput('[data-testid="gateway-service-name-input"]', serviceName, { scroll: false });
    
    clickWhenEnabled('[data-testid="service-create-form-submit"]', { force: false });
    
    // Verify unique constraint error
    cy.contains(SERVICE_CREATION_ERRORS.UNIQUE_CONSTRAINT(serviceName)).should('be.visible');
  });
});
