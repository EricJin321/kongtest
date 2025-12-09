import ServiceWebApi from '../utils/servicewebapi';
import KongManager from '../utils/kongManager';

describe('Method Not Supported API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const testService = 'MethodNotSupportService';
  const testRouteName = 'MethodNotSupportRoute';
  const testRoutePath = '/methodtest';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService('http://mockserver:1080', { name: testService }).then((id) => {
      // Create a Route for the newly created service - only GET method is allowed
      return KongManager.createRoute(id, { name: testRouteName, path: testRoutePath, methods: ['GET'] });
    })
    // Wait according to configured propagation time (in endpoints.json)
    .then(() => cy.fixture('config/endpoints.json').then(cfg => cy.wait(cfg.servicePropagationWaitMs || 8000)));
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
});
