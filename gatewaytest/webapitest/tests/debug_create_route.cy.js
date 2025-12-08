import KongManager from '../utils/kongManager.js';
import { writeLog } from '../utils/logger.js';

describe('Comprehensive API Tests', () => {
  const basicTestService = 'BasicTestService';

  before(() => {
    // Create service and route (debug)
    return KongManager.createService('http://mockserver:1080', { name: basicTestService }).then((id) => {
      cy.wrap(id).as('createdServiceId');
      return KongManager.createRoute(id, { name: 'BasicRoute', path: '/testbasic', methods: ['GET','PUT'] }).then((routeId) => {
        return cy.wrap(routeId).as('createdRouteId');
      });
    });
  });

  // noop test to ensure hooks run visibly in the runner
  it('noop test to allow hooks to run', function () {
    writeLog('it: noop test');
  });

  after(() => {
    // Cleanup: delete route then service, returning the chain so Cypress waits
    return KongManager.deleteRoute('BasicRoute')
      .then(() => KongManager.deleteService('BasicTestService'));
  });
});
