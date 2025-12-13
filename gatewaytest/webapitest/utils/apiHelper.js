/**
 * @fileoverview API request helper for Cypress tests
 * @description Wrapper for cy.request() with enhanced logging and error handling.
 * Provides standardized API request execution with configurable timeouts and SSL verification.
 */

import { writeLog } from '../../utils/logger.js';

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
  
    // Build log message (we will write it to file via writeLog and not log to screen)
    let logMessage = `apiRequest called with URL: ${url}, method: ${method}, isHttps: ${isHttps}`;
    if (body) {
      logMessage += `, body: ${JSON.stringify(body)}`;
    }
    if (Object.keys(headers).length > 0) {
      logMessage += `, headers: ${JSON.stringify(headers)}`;
    }
  
    // Start by writing the request log, then perform the request, then log the response.
    return writeLog(logMessage)
      .then(() => {
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

  // Add followRedirect if specified, otherwise default to false
  if (options.followRedirect !== undefined) {
    requestOptions.followRedirect = options.followRedirect;
  } else {
    requestOptions.followRedirect = false;
  }

  // Ignore TLS validation for self-signed certificates on HTTPS
  if (isHttps) {
    requestOptions.rejectUnauthorized = false;
    requestOptions.insecure = true;
  }

        return cy.request(requestOptions)
          .then((response) => {
            // Safely stringify the body for logging
            let bodyStr;
            try {
              bodyStr = JSON.stringify(response && response.body);
            } catch (e) {
              bodyStr = '[unserializable]';
            }

            // Safely stringify the headers for logging
            let headersStr;
            try {
              headersStr = JSON.stringify(response && response.headers);
            } catch (e) {
              headersStr = '[unserializable]';
            }

            const taskMessage = `apiRequest response: status=${response && response.status}, headers=${headersStr}, body=${bodyStr}`;

            // Write response log and return the response wrapped as a chainable
            return writeLog(taskMessage).then(() => cy.wrap(response));
          });
      });
}
