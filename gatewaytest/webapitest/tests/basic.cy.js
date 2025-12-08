import ServiceWebApi from '../utils/servicewebapi';
import { writeLog } from '../utils/logger.js';

describe('Basic API Tests', function () {
  // Minimal alias experiment moved into the original describe to keep the suite structure
  before(function () {
    // set alias for a known name
    writeLog('before: alias createdServiceName is going to set');
    cy.wrap('BasicTestService').as('createdServiceName');
    writeLog('before: alias createdServiceName set');
  });

  after(function () {
    // try to read alias set in before
    writeLog('after: after hook started');
    cy.get('@createdServiceName').then(function (name) {
      // Log and assert to make results obvious in runner
      writeLog(`after: read alias createdServiceName -> ${name}`);
      expect(name).to.equal('BasicTestService');
    });
    writeLog('after: after hook finished');
  });

  it('HTTPS hello endpoint should return 200 with correct response', function () {
    writeLog('it: starting helloApi test');
    ServiceWebApi.getHelloApi(false, 200, { msg: 'hello world' });
    writeLog('it: finished helloApi test');
  });

  // noop test to ensure hooks run visibly in the runner
  it('noop test to allow hooks to run', function () {
    writeLog('it: noop test');
  });
});
