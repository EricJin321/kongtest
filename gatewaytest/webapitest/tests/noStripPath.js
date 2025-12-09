import ServiceWebApi from '../utils/servicewebapi';
import KongManager from '../utils/kongManager';

describe('NoStripPath API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const basicTestService = 'NoStripService';
  const basicRouteName = 'NoStripRoute';
  const basicRoutePath = '/mock';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService('http://mockserver:1080', { name: basicTestService }).then((id) => {
      // Create a Route for the newly created service using KongManager helper
      return KongManager.createRoute(id, { name: basicRouteName, path: basicRoutePath, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'] }, false);
    })
    // Wait according to configured propagation time (in endpoints.json)
    .then(() => cy.fixture('config/endpoints.json').then(cfg => cy.wait(cfg.servicePropagationWaitMs || 8000)));
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
