/**
 * @fileoverview Route multiple paths test for Kong Gateway
 * @description Tests that a single route can handle multiple paths configured in Advanced mode.
 * Verifies that requests to both the primary path and additional paths are correctly routed.
 */

import ServiceWebApi from '../utils/servicewebapi.js';
import KongManager from '../../utils/kongManager.js';

describe('RouteMultiplePath API Tests', () => {
  const serviceName = 'RouteMultiplePathService';
  const routeName = 'MultiplePathRoute';
  const primaryPath = '/primary';
  const secondaryPath = '/secondary';

  before(() => {
    // Create a service and route with multiple paths
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: serviceName })
      .then((id) => KongManager.createRoute(id, { 
        name: routeName, 
        path: primaryPath, 
        extraPaths: [secondaryPath],
        methods: ['GET'] 
      }))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  beforeEach(() => {
    return cy.log('Starting RouteMultiplePath API test');
  });

  after(() => {
    // Clean up route and service
    return KongManager.deleteRoute(routeName)
      .then(() => KongManager.deleteService(serviceName));
  });

  it('should test getHelloApi with primary path', () => {
    ServiceWebApi.getHelloApi(primaryPath, false, 200, { msg: 'hello world' });
  });

  it('should test getHelloApi with secondary path', () => {
    ServiceWebApi.getHelloApi(secondaryPath, false, 200, { msg: 'hello world' });
  });
});
