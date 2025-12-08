import ServiceWebApi from '../utils/servicewebapi';
import KongManager from '../utils/kongManager';

describe('Comprehensive API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const basicTestService = 'BasicTestService';

  before(() => {
    // Create a service in Kong Manager via UI and alias its id; the name is the known constant
    return KongManager.createService('http://mockserver:1080', { name: basicTestService }).then((id) => {
      cy.wrap(id).as('createdServiceId');
    });
  });

  beforeEach(() => {
    cy.log('Starting comprehensive API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known basicTestService constant
    if (basicTestService) {
      KongManager.deleteService(basicTestService);
    }
  });

  it('should test getHelloApi', () => {
    ServiceWebApi.getHelloApi(false, 200, { msg: 'hello world' });
  });

  it('should test getResourceApi without If-Modified-Since', () => {
    ServiceWebApi.getResourceApi(false, null, 200, { data: 'fresh resource' });
  });

  it('should test getResourceApi with If-Modified-Since header', () => {
    ServiceWebApi.getResourceApi(false, 'Wed, 21 Oct 2023 07:28:00 GMT', 304);
  });

  it('should test getRedirectApi with followRedirect true', () => {
    ServiceWebApi.getRedirectApi(false, true, 200, '<html><body>New location reached</body></html>');
  });

  it('should test getRedirectApi with followRedirect false', () => {
    ServiceWebApi.getRedirectApi(false, false, 302);
  });

  it('should test getPrivateApi without token', () => {
    ServiceWebApi.getPrivateApi(false, null, 401, { error: 'Unauthorized' });
  });

  it('should test getPrivateApi with valid token', () => {
    ServiceWebApi.getPrivateApi(false, 'secret-token', 200, { msg: 'authorized' });
  });

  it('should test getForbiddenApi', () => {
    ServiceWebApi.getForbiddenApi(false, 403, { error: 'Forbidden' });
  });

  it('should test getServerErrorApi', () => {
    ServiceWebApi.getServerErrorApi(false, 500, { error: 'Internal Server Error' });
  });

  it('should test postItemApi', () => {
    ServiceWebApi.postItemApi(false, {}, 201, { id: 123, msg: 'created' });
  });

  it('should test putItemApi', () => {
    ServiceWebApi.putItemApi(false, '123', 204);
  });

  it('should test deleteItemApi with existing item', () => {
    ServiceWebApi.deleteItemApi(false, '123', 204);
  });

  it('should test deleteItemApi with non-existing item', () => {
    ServiceWebApi.deleteItemApi(false, '999', 404, { error: 'not found' });
  });

  it('should test putUserApi', () => {
    ServiceWebApi.putUserApi(false, '456', 200, { msg: 'user updated' });
  });

  it('should test postEchoApi', () => {
    ServiceWebApi.postEchoApi(false, 'test data', 200, { msg: 'echo response (fixed example)' });
  });

  it('should test getBadRequestApi', () => {
    ServiceWebApi.getBadRequestApi(false, 400, { error: 'Bad Request' });
  });
});

