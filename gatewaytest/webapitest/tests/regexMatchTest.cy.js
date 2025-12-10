import ServiceWebApi from '../utils/servicewebapi';
import KongManager from '../../utils/kongManager';

describe('Regex Match Test API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const testService = 'RegexMatchTestService';
  const testRouteName = 'RegexMatchRoute';
  const lowerRoutePath = '/regex-match';
  const upperRoutePath = '/Regex-Match';
  const noMatchPath = '/no-match';

  before(() => {
    // Create a service in Kong Manager via UI
    return KongManager.createService('http://mockserver:1080', { name: testService }).then((id) => {
      // Create a Route with regex pattern - case insensitive match for paths starting with /regex
      return KongManager.createRoute(id, { name: testRouteName, path: '~/(?i)regex.*ch/', methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'] });
    })
    // Wait according to configured propagation time (in endpoints.json)
    .then(() => cy.fixture('config/endpoints.json').then(cfg => cy.wait(cfg.servicePropagationWaitMs || 8000)));
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
