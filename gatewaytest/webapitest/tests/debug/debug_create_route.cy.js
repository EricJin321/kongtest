/**
 * @fileoverview Debug test for service and route creation
 * @description Minimal test to verify KongManager service/route creation flow.
 */

import KongManager from '../../../utils/kongManager.js';
import { writeLog } from '../../../utils/logger.js';

describe('Comprehensive API Tests', () => {
  const basicTestService = 'BasicTestService';

  before(() => {
    // Create service and route (debug)
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: basicTestService }).then((id) => {
      return KongManager.createRoute(id, { name: 'BasicRoute', path: '/testbasic', methods: ['GET','PUT'] });
    });
  });

  // noop test to ensure hooks run visibly in the runner
  it('noop test to allow hooks to run', function () {
    writeLog('it: noop test', 'DEBUG');
  });

  after(() => {
    // Cleanup: delete route then service, returning the chain so Cypress waits
    return KongManager.deleteRoute('BasicRoute')
      .then(() => KongManager.deleteService('BasicTestService'));
  });
});
