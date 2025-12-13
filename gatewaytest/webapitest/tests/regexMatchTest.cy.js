/**
 * @fileoverview Regex path matching tests for Kong Gateway
 * @description Tests Kong's regex path matching capabilities with case-insensitive patterns.
 * Verifies that routes with regex paths correctly match or reject incoming requests.
 */

import ServiceWebApi from '../utils/servicewebapi.js';
import KongManager from '../../utils/kongManager.js';

describe('Regex Match Test API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const testService = 'RegexMatchTestService';
  const testRouteName = 'RegexMatchRoute';
  const lowerRoutePath = '/regex-match';
  const upperRoutePath = '/Regex-Match';
  const noMatchPath = '/no-match';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: testService })
      .then((id) => KongManager.createRoute(id, { name: testRouteName, path: '~/(?i)regex.*ch/', methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'] }))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  beforeEach(() => {
    return cy.log('Starting Regex Match Test API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known testService constant
    return KongManager.deleteRoute(testRouteName)
      .then(() => KongManager.deleteService(testService));
  });

  // Test with lowercase path - should match the regex pattern
  it('should test getHelloApi with lowercase path (should match)', () => {
    ServiceWebApi.getHelloApi(lowerRoutePath, false, 200, { msg: 'hello world' });
  });

  // Test with uppercase path - should match the regex pattern (case insensitive)
  it('should test getHelloApi with uppercase path (should match)', () => {
    ServiceWebApi.getHelloApi(upperRoutePath, false, 200, { msg: 'hello world' });
  });

  // Test with non-matching path - should not match the regex pattern
  it('should test getHelloApi with non-matching path (should fail)', () => {
    ServiceWebApi.getHelloApi(noMatchPath, false, 404, null);
  });
});
