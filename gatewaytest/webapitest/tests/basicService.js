import ServiceWebApi from '../utils/servicewebapi';
import KongManager from '../utils/kongManager';

describe('Comprehensive API Tests', () => {
  // Top-level known service name constant (module-scoped)
  const basicTestService = 'BasicTestService';
  const basicRouteName = 'BasicRoute';
  const basicRoutePath = '/testbasic';

  before(() => {
    // Create a service in Kong Manager via UI and alias its id; the name is the known constant
    return KongManager.createService('http://mockserver:1080', { name: basicTestService }).then((id) => {
      cy.wrap(id).as('createdServiceId');
      // Create a Route for the newly created service using KongManager helper
      return KongManager.createRoute(id, { name: basicRouteName, path: basicRoutePath, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'] }).then((routeId) => {
        cy.wrap(routeId).as('createdRouteId');
      });
    });
  });

  beforeEach(() => {
    cy.log('Starting comprehensive API test');
  });

  after(() => {
    // Delete the service created in the before hook using the known basicTestService constant
    
  });

  it('should test getHelloApi', () => {
    ServiceWebApi.getHelloApi(basicRoutePath, false, 200, { msg: 'hello world' });
  });

  it('should test getResourceApi without If-Modified-Since', () => {
    ServiceWebApi.getResourceApi(basicRoutePath, false, null, 200, { data: 'fresh resource' });
  });

  it('should test getResourceApi with If-Modified-Since header', () => {
    ServiceWebApi.getResourceApi(basicRoutePath, false, 'Wed, 21 Oct 2023 07:28:00 GMT', 304, undefined);
  });

  //it('should test getRedirectApi with followRedirect true', () => {
  //  ServiceWebApi.getRedirectApi(basicRoutePath, false, true, 200, '<html><body>New location reached</body></html>');
  //});

  it('should test getRedirectApi with followRedirect false', () => {
    ServiceWebApi.getRedirectApi(basicRoutePath, false, false, 302, undefined);
  });

  it('should test getPrivateApi without token', () => {
    ServiceWebApi.getPrivateApi(basicRoutePath, false, null, 401, { error: 'Unauthorized' });
  });

  it('should test getPrivateApi with valid token', () => {
    ServiceWebApi.getPrivateApi(basicRoutePath, false, 'secret-token', 200, { msg: 'authorized' });
  });

  it('should test getForbiddenApi', () => {
    ServiceWebApi.getForbiddenApi(basicRoutePath, false, 403, { error: 'Forbidden' });
  });

  it('should test getServerErrorApi', () => {
    ServiceWebApi.getServerErrorApi(basicRoutePath, false, 500, { error: 'Internal Server Error' });
  });

  it('should test postItemApi', () => {
    ServiceWebApi.postItemApi(basicRoutePath, false, {}, 201, { id: 123, msg: 'created' });
  });

  it('should test putItemApi', () => {
    ServiceWebApi.putItemApi(basicRoutePath, false, '123', 204, undefined);
  });

  it('should test deleteItemApi with existing item', () => {
    ServiceWebApi.deleteItemApi(basicRoutePath, false, '123', 204, undefined);
  });

  it('should test deleteItemApi with non-existing item', () => {
    ServiceWebApi.deleteItemApi(basicRoutePath, false, '999', 404, { error: 'not found' });
  });

  it('should test putUserApi', () => {
    ServiceWebApi.putUserApi(basicRoutePath, false, '456', 200, { msg: 'user updated' });
  });

  it('should test postEchoApi', () => {
    ServiceWebApi.postEchoApi(basicRoutePath, false, 'test data', 200, { msg: 'echo response (fixed example)' });
  });

  it('should test getBadRequestApi', () => {
    ServiceWebApi.getBadRequestApi(basicRoutePath, false, 400, { error: 'Bad Request' });
  });
});

