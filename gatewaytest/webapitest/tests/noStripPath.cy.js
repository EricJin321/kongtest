/**
 * @fileoverview Route path stripping behavior tests for Kong Gateway
 * @description Tests Kong's strip_path=false configuration, verifying that the route path
 * is preserved when forwarding requests to the upstream service.
 */

import ServiceWebApi from '../utils/servicewebapi.js';
import KongManager from '../../utils/kongManager.js';

describe('NoStripPath API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const basicTestService = 'NoStripService';
  const basicRouteName = 'NoStripRoute';
  const basicRoutePath = '/mock';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: basicTestService })
      .then((id) => KongManager.createRoute(id, { name: basicRouteName, path: basicRoutePath, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'] }, false))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  beforeEach(() => {
    return cy.log('Starting NoStripPath API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known basicTestService constant
    return KongManager.deleteRoute(basicRouteName)
      .then(() => KongManager.deleteService(basicTestService));
  });

  it('should test getHelloApi', () => {
    ServiceWebApi.getHelloApi('', false, 200, { msg: 'hello world' });
  });

  it('should test getRedirectApi with followRedirect false', () => {
    ServiceWebApi.getRedirectApi('', false, false, 302, undefined);
  });

  it('should test getRedirectApi with followRedirect true', () => {
    ServiceWebApi.getRedirectApi('', false, true, 200, '<html><body>New location reached</body></html>');
  });

});
