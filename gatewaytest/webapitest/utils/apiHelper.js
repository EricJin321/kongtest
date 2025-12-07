import { writeLog } from './logger.js';

/**
 * Send HTTP/HTTPS request
 * @param {string} url - Full request URL
 * @param {boolean} isHttps - Whether it's an HTTPS request
 * @returns {Cypress.Chainable} Response object
 */
export function apiRequest(url, isHttps = false) {
  writeLog(`apiRequest called with URL: ${url}, isHttps: ${isHttps}`);
  cy.log(`Final URL: ${url}`);
  
  const requestOptions = {
    url: url,
    method: 'GET',
    failOnStatusCode: false, // Do not throw exception, allow non-200 status codes
  };

  // Ignore TLS validation for self-signed certificates on HTTPS
  if (isHttps) {
    requestOptions.rejectUnauthorized = false;
    requestOptions.insecure = true;
  }

  return cy.request(requestOptions);
}
