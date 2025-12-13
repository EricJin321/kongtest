/**
 * @fileoverview HTTPS service API tests for Kong Gateway
 * @description Tests API operations through a Kong service configured with HTTPS upstream.
 * Verifies that Kong correctly proxies HTTPS requests to the backend service.
 */

import ServiceWebApi from '../utils/servicewebapi.js';
import KongManager from '../../utils/kongManager.js';

describe('HTTPS TestService API Tests', () => {
  // Module-scoped constants for this HTTPS variant
  const httpsTestService = 'BasicTestServiceHttps';
  const httpsRouteName = 'BasicRouteHttps';
  const httpsRoutePath = '/testhttps';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService(Cypress.env('mockServerHttps'), { name: httpsTestService })
      .then((id) => KongManager.createRoute(id, { name: httpsRouteName, path: httpsRoutePath, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'] }))
      .then(() => cy.wait(Cypress.env('servicePropagationWaitMs')));
  });

  beforeEach(() => {
    return cy.log('Starting HTTPS TestService API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known httpsTestService constant
    return KongManager.deleteRoute(httpsRouteName)
      .then(() => KongManager.deleteService(httpsTestService));
  });

  it('should test getHelloApi', () => {
    ServiceWebApi.getHelloApi(httpsRoutePath, true, 200, { msg: 'hello world' });
  });
  
  it('should pass with http', () => {
    ServiceWebApi.getHelloApi(httpsRoutePath, false, 200, { msg: 'hello world' });
  });

  it('should test getResourceApi without If-Modified-Since', () => {
    ServiceWebApi.getResourceApi(httpsRoutePath, true, null, 200, { data: 'fresh resource' });
  });

  it('should test getResourceApi with If-Modified-Since header', () => {
    ServiceWebApi.getResourceApi(httpsRoutePath, true, 'Wed, 21 Oct 2023 07:28:00 GMT', 304, undefined);
  });

  it('should test getRedirectApi with followRedirect false', () => {
    ServiceWebApi.getRedirectApi(httpsRoutePath, true, false, 302, undefined);
  });

  it('should test getPrivateApi without token', () => {
    ServiceWebApi.getPrivateApi(httpsRoutePath, true, null, 401, { error: 'Unauthorized' });
  });

  it('should test getPrivateApi with valid token', () => {
    ServiceWebApi.getPrivateApi(httpsRoutePath, true, 'secret-token', 200, { msg: 'authorized' });
  });

  it('should test getForbiddenApi', () => {
    ServiceWebApi.getForbiddenApi(httpsRoutePath, true, 403, { error: 'Forbidden' });
  });

  it('should test getServerErrorApi', () => {
    ServiceWebApi.getServerErrorApi(httpsRoutePath, true, 500, { error: 'Internal Server Error' });
  });

  it('should test postItemApi', () => {
    ServiceWebApi.postItemApi(httpsRoutePath, true, {}, 201, { id: 123, msg: 'created' });
  });

  it('should test putItemApi', () => {
    ServiceWebApi.putItemApi(httpsRoutePath, true, '123', 204, undefined);
  });

  it('should test deleteItemApi with existing item', () => {
    ServiceWebApi.deleteItemApi(httpsRoutePath, true, '123', 204, undefined);
  });

  it('should test deleteItemApi with non-existing item', () => {
    ServiceWebApi.deleteItemApi(httpsRoutePath, true, '999', 404, { error: 'not found' });
  });

  it('should test putUserApi', () => {
    ServiceWebApi.putUserApi(httpsRoutePath, true, '456', 200, { msg: 'user updated' });
  });

  it('should test postEchoApi', () => {
    ServiceWebApi.postEchoApi(httpsRoutePath, true, 'test data', 200, { msg: 'echo response (fixed example)' });
  });

  it('should test getBadRequestApi', () => {
    ServiceWebApi.getBadRequestApi(httpsRoutePath, true, 400, { error: 'Bad Request' });
  });
});
