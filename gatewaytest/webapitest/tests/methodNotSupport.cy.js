/**
 * @fileoverview HTTP method restriction tests for Kong Gateway
 * @description Tests that Kong correctly enforces HTTP method restrictions on routes.
 * Verifies that requests with non-allowed methods return 404 Not Found.
 */

import ServiceWebApi from '../utils/servicewebapi.js';
import KongManager from '../../utils/kongManager.js';

describe('Method Not Supported API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const testService = 'MethodNotSupportService';
  const testRouteName = 'MethodNotSupportRoute';
  const testRoutePath = '/methodtest';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: testService })
      .then((id) => KongManager.createRoute(id, { name: testRouteName, path: testRoutePath, methods: ['GET'] }))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  beforeEach(() => {
    return cy.log('Starting Method Not Supported API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known testService constant
    return KongManager.deleteRoute(testRouteName)
      .then(() => KongManager.deleteService(testService));
  });

  // GET method should work (200)
  it('should test getHelloApi with GET method (allowed)', () => {
    ServiceWebApi.getHelloApi(testRoutePath, false, 200, { msg: 'hello world' });
  });

  // All non-GET methods should return 404 or 405 (Method Not Allowed)
  // Kong typically returns 404 when method is not in the allowed list for a route
  
  it('should test postItemApi with POST method (not allowed)', () => {
    ServiceWebApi.postItemApi(testRoutePath, false, {}, 404, null);
  });

  it('should test putItemApi with PUT method (not allowed)', () => {
    ServiceWebApi.putItemApi(testRoutePath, false, '123', 404, null);
  });

  it('should test deleteItemApi with DELETE method (not allowed)', () => {
    ServiceWebApi.deleteItemApi(testRoutePath, false, '123', 404, null);
  });

  it('should test putUserApi with PUT method (not allowed)', () => {
    ServiceWebApi.putUserApi(testRoutePath, false, '456', 404, null);
  });

  it('should test postEchoApi with POST method (not allowed)', () => {
    ServiceWebApi.postEchoApi(testRoutePath, false, 'test data', 404, null);
  });
  describe('POST-only route tests', () => {
    const postOnlyService = 'PostOnlyService';
    const postOnlyRoute = 'PostOnlyRoute';
    const postOnlyPath = '/postonly';

    before(() => {
      return KongManager.createService(Cypress.env('mockServerHttp'), { name: postOnlyService })
        .then((id) => KongManager.createRoute(id, { name: postOnlyRoute, path: postOnlyPath, methods: ['POST'] }))
        .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
    });

    after(() => {
      return KongManager.deleteRoute(postOnlyRoute).then(() => KongManager.deleteService(postOnlyService));
    });

    it('GET should return 404 for POST-only route', () => {
      ServiceWebApi.getHelloApi(postOnlyPath, false, 404, null);
    });

    it('POST should succeed for POST-only route', () => {
      return ServiceWebApi.postItemApi(postOnlyPath, false, {}, 201, { id: 123, msg: 'created' });
    });
  });
});
