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

  it('should validate URL format - accept valid URLs and reject invalid ones', () => {
    // Test valid URL formats - should NOT show error
    const validUrls = [
      'http://abc:0',
      'https://abc:63335',
      'grpc://abc',
      'ws://abc',
      'wss://abc'
    ];

    cy.wrap(validUrls).each((url) => {
      cy.log(`Testing valid URL: ${url}`);
      fillInput(SERVICE_SELECTORS.URL_INPUT, url, { scroll: false });
      // Verify NO error message appears
      cy.get('.help-text').should('not.be.visible');
      cy.get(SERVICE_SELECTORS.URL_INPUT).clear();
    });

    // Test invalid URL formats - should show error
    const invalidUrls = [
      { url: 'file://abc', description: 'file:// protocol' },
      { url: 'ftp://abc', description: 'ftp:// protocol' },
      { url: 'data:text/html,<h1>test</h1>', description: 'data: URI' },
      { url: 'http://abc:-1', description: 'negative port' },
      { url: 'http://abc:a', description: 'non-numeric port' },
      { url: 'http://abc:65536', description: 'port > 65535' },
      { url: 'http://a bc', description: 'space in hostname' },
      { url: 'http://:8080', description: 'missing hostname' },
      { url: 'http://-abc', description: 'hostname starts with hyphen' },
      { url: 'http://.abc', description: 'hostname starts with dot' },
      { url: 'http://256.1.1.1', description: 'invalid IP octet > 255' },
      //{ url: 'http://1.1.1', description: 'incomplete IP address' },
      //{ url: 'http://abc/path with spaces', description: 'unencoded spaces in path' },
      //{ url: 'http://abc?query=<script>', description: 'invalid characters in query' },
      //{ url: 'http://abc/path"quote', description: 'unencoded quote in path' }
    ];

    cy.wrap(invalidUrls).each((testCase) => {
      cy.log(`Testing invalid URL: ${testCase.description} - ${testCase.url}`);
      fillInput(SERVICE_SELECTORS.URL_INPUT, testCase.url, { scroll: false });
      // Verify error message appears
      cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_URL)
        .should('be.visible');
      cy.get(SERVICE_SELECTORS.URL_INPUT).clear();
    });
  });

  it('should show errors for invalid Host and Port in manual configuration mode', () => {
    // Click manual configuration radio button
    cy.get(SERVICE_SELECTORS.PROTOCOL_RADIO_LABEL)
      .scrollIntoView()
      .should('be.visible')
      .click();

    // Leave Host empty and fill Port with invalid value (65536)
    fillInput(SERVICE_SELECTORS.PORT_INPUT, '65536', { scroll: true });

    // Verify both error messages appear
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_HOST_EMPTY)
      .scrollIntoView()
      .should('be.visible');
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_PORT_RANGE)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Name (MyService$$)', () => {
    fillInput(SERVICE_SELECTORS.NAME_INPUT, 'MyService$$', { scroll: true });
    cy.contains('.help-text', SERVICE_CREATION_ERRORS.INVALID_NAME)
      .should('be.visible');

    // Clear input as requested
    cy.get(SERVICE_SELECTORS.NAME_INPUT).clear();
  });
});

describe('Service Creation with Schema Violation URLs', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
  });

  it('should show error for invalid Retries (32768)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Retries with 32768 (exceeds maximum)
    fillInput(SERVICE_SELECTORS.RETRIES_INPUT, '32768', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_RETRIES)
      .scrollIntoView()
      .should('be.visible');
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
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message (it appears in a toast/alert list, not help-text)
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_CONN_TIMEOUT)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Write Timeout (2147483647)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Write Timeout with 2147483647 (exceeds maximum)
    fillInput(SERVICE_SELECTORS.WRITE_TIMEOUT_INPUT, '2147483647', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_WRITE_TIMEOUT)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Read Timeout (0)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Read Timeout with 0
    fillInput(SERVICE_SELECTORS.READ_TIMEOUT_INPUT, '0', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_READ_TIMEOUT)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Connection Timeout (2147483647)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Connection Timeout with 2147483647 (exceeds maximum)
    fillInput(SERVICE_SELECTORS.CONN_TIMEOUT_INPUT, '2147483647', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_CONN_TIMEOUT)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Write Timeout (2147483647)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Write Timeout with 2147483647 (exceeds maximum)
    fillInput(SERVICE_SELECTORS.WRITE_TIMEOUT_INPUT, '2147483647', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_WRITE_TIMEOUT)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Read Timeout (2147483647)', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://localhost:1080/', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Read Timeout with 2147483647 (exceeds maximum)
    fillInput(SERVICE_SELECTORS.READ_TIMEOUT_INPUT, '2147483647', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_READ_TIMEOUT)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should reject URL with incomplete IP address and show schema violation error', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://1.1.1', { scroll: false });
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify schema violation error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_HOST_VALUE('1.1.1'))
      .scrollIntoView()
      .should('be.visible');
  });

  it('should reject URL with unencoded spaces in path and show schema violation error', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://abc/path with spaces', { scroll: false });
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify schema violation error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_PATH_RFC3986('/path with spaces'))
      .scrollIntoView()
      .should('be.visible');
  });

  it('should reject URL with invalid characters in query and show schema violation error', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://abc?query=<script>', { scroll: false });
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify schema violation error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_HOST_VALUE('abc?query=<script>'))
      .scrollIntoView()
      .should('be.visible');
  });

  it('should reject URL with unencoded quote in path and show schema violation error', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://abc/path"quote', { scroll: false });
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify schema violation error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_PATH_RFC3986('/path"quote'))
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for Client certificate with HTTP protocol', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://abc', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Client certificate with a UUID
    fillInput(SERVICE_SELECTORS.CLIENT_CERT_INPUT, '550e8400-e29b-41d4-a716-446655440000', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_CLIENT_CERT_HTTP)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for CA certificates with HTTP protocol', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'http://abc', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill CA certificates with a UUID
    fillInput(SERVICE_SELECTORS.CA_CERTS_INPUT, '550e8400-e29b-41d4-a716-446655440001', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_CA_CERTS_HTTP)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Client certificate UUID format', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'https://abc', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill Client certificate with invalid UUID
    fillInput(SERVICE_SELECTORS.CLIENT_CERT_INPUT, 'edf', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_CLIENT_CERT_UUID)
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid CA certificates UUID format', () => {
    fillInput(SERVICE_SELECTORS.URL_INPUT, 'https://abc', { scroll: false });
    // Click "View advanced fields"
    cy.get(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT)
      .contains('View advanced fields')
      .should('be.visible')
      .click();
    
    // Fill CA certificates with invalid UUID
    fillInput(SERVICE_SELECTORS.CA_CERTS_INPUT, 'edf', { scroll: true });
    
    // Click Save
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    
    // Verify URL did not navigate away (still on create page)
    cy.url().should('include', URL_PATHS.SERVICES_CREATE);
    
    // Verify error message appears
    cy.contains('li', SERVICE_CREATION_ERRORS.INVALID_CA_CERTS_UUID)
      .scrollIntoView()
      .should('be.visible');
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
