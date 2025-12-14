/**
 * @fileoverview Protocol restriction tests for Kong Gateway
 * @description Tests Kong's protocol enforcement (HTTP/HTTPS) and redirect behavior.
 * Verifies that HTTPS-only routes reject HTTP requests or redirect with appropriate status codes.
 */

import ServiceWebApi from '../utils/servicewebapi.js';
import KongManager from '../../utils/kongManager.js';

describe('HTTP Block Test API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const testService = 'HttpBlockTestService';
  const testRouteName = 'HttpBlockRoute';
  const testRoutePath = '/httpblock';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: testService })
      .then((id) => KongManager.createRoute(id, { 
        name: testRouteName, 
        path: testRoutePath, 
        methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'],
        protocols: 'HTTPS'
      }))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  beforeEach(() => {
    return cy.log('Starting HTTP Block Test API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known testService constant
    return KongManager.deleteRoute(testRouteName)
      .then(() => KongManager.deleteService(testService));
  });

  // Test HTTP request on HTTPS-only route - should return 426 Upgrade Required
  it('should test getHelloApi with HTTP (expect 426 Upgrade Required)', () => {
    ServiceWebApi.getHelloApi(testRoutePath, false, 426, null);
  });
  
  it('should pass with https', () => {
    ServiceWebApi.getHelloApi(testRoutePath, true, 200, { msg: 'hello world' });
  });
});

describe('HTTPS Redirect Code 302 Test', () => {
  const redirectService = 'RedirectService';
  const redirectRoute = 'RedirectRoute';
  const redirectPath = '/redirecttest';

  before(() => {
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: redirectService })
      .then((id) => KongManager.createRoute(id, {
        name: redirectRoute,
        path: redirectPath,
        methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'],
        protocols: 'HTTPS',
        httpRedirectCode: 302
      }))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  after(() => {
    return KongManager.deleteRoute(redirectRoute).then(() => KongManager.deleteService(redirectService));
  });

  it('HTTP request should receive 302 redirect to HTTPS', () => {
    // Use getRedirectApi with followRedirect=false to verify the 302 status without following it
    ServiceWebApi.getHelloApi(redirectPath, false, 302, null);
  });
  
  it('should pass with https', () => {
    ServiceWebApi.getHelloApi(redirectPath, true, 200, { msg: 'hello world' });
  });
});
