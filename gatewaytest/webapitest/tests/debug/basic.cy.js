/**
 * @fileoverview Debug test for basic API operations
 * @description Minimal test suite for debugging API request/response behavior.
 */

import ServiceWebApi from '../../utils/servicewebapi.js';
import { writeLog } from '../../../utils/logger.js';

describe('Basic API Tests', function () {
  const basicRoutePath = '/testbasic';
  // Minimal alias experiment moved into the original describe to keep the suite structure
  before(function () {
    // set alias for a known name
    writeLog('before: alias createdServiceName is going to set', 'DEBUG');
    return cy.wrap('BasicTestService').as('createdServiceName');
  });

  after(function () {
    // try to read alias set in before
    writeLog('after: after hook started', 'DEBUG');
    cy.get('@createdServiceName').then(function (name) {
      // Log and assert to make results obvious in runner
      writeLog(`after: read alias createdServiceName -> ${name}`, 'DEBUG');
      expect(name).to.equal('BasicTestService');
    });
    writeLog('after: after hook finished', 'DEBUG');
  });

  it('HTTPS hello endpoint should return 200 with correct response', function () {
    writeLog('it: starting helloApi test', 'DEBUG');
    ServiceWebApi.getHelloApi(basicRoutePath, false, 200, { msg: 'hello world' });
    writeLog('it: finished helloApi test', 'DEBUG');
  });

  // noop test to ensure hooks run visibly in the runner
  it('noop test to allow hooks to run', function () {
    writeLog('it: noop test', 'DEBUG');
  });
});
