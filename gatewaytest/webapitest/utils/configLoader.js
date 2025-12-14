/**
 * @fileoverview Configuration loader for API tests
 * @description Provides runtime access to test configuration including base URLs
 * and endpoint construction for API requests.
 */

import { buildBaseUrl } from './configHelper.js';

/**
 * Get base URL for the given environment and protocol
 * Reads from endpoints.json fixture and uses shared buildBaseUrl logic
 * @param {string} environment - Environment name ('local', 'staging', 'production')
 * @param {string} protocol - Protocol name ('http', 'https')
 * @returns {Cypress.Chainable} Complete base URL with port
 */
export function getBaseUrl(environment, protocol) {
  return cy.fixture('config/endpoints.json').then((config) => {
    return buildBaseUrl(config, environment, protocol);
  });
}

/**
 * Build complete request URL
 * @param {string} baseUrl - Base URL (with protocol, host, and port)
 * @param {string} path - Endpoint path
 * @returns {string} Complete URL
 */
export function buildUrl(baseUrl, path) {
  return baseUrl + path;
}
