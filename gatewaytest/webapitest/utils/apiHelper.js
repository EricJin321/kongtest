import { writeLog } from './logger.js';

/**
 * Send HTTP/HTTPS request
 * @param {string} url - Full request URL
 * @param {boolean} isHttps - Whether it's an HTTPS request
 * @param {object} options - Additional request options (method, body, headers, etc.)
 * @returns {Cypress.Chainable} Response object
 */
export function apiRequest(url, isHttps = false, options = {}) {
  const method = options.method || 'GET';
  const body = options.body;
  const headers = options.headers || {};
  
  // Build log message
  let logMessage = `apiRequest called with URL: ${url}, method: ${method}, isHttps: ${isHttps}`;
  if (body) {
    logMessage += `, body: ${JSON.stringify(body)}`;
  }
  if (Object.keys(headers).length > 0) {
    logMessage += `, headers: ${JSON.stringify(headers)}`;
  }
  
  writeLog(logMessage);
  cy.log(`Final URL: ${url}, Method: ${method}`);
  
  const requestOptions = {
    url: url,
    method: method,
    failOnStatusCode: false, // Do not throw exception, allow non-200 status codes
  };

  // Add body if provided
  if (body) {
    requestOptions.body = body;
  }

  // Add headers if provided
  if (Object.keys(headers).length > 0) {
    requestOptions.headers = headers;
  }

  // Add followRedirect if specified
  if (options.followRedirect !== undefined) {
    requestOptions.followRedirect = options.followRedirect;
  }

  // Ignore TLS validation for self-signed certificates on HTTPS
  if (isHttps) {
    requestOptions.rejectUnauthorized = false;
    requestOptions.insecure = true;
  }

  return cy.request(requestOptions);
}
