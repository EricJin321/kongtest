/**
 * @fileoverview Service and route list verification tests
 * @description Tests that created services and routes appear correctly in their
 * respective list pages with proper table rendering and data visibility.
 */

import KongManager from '../../utils/kongManager.js';
import { writeLog } from '../../utils/logger.js';
import { findRowByName } from '../../utils/uiHelpers.js';
import { TABLE_SELECTORS, URL_PATHS } from '../../utils/constants.js';

describe('Service List Verification', () => {
  const serviceName = 'ListVerifyService';

  before(() => {
    // Create service
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: serviceName });
  });

  it('should display the created service in the service list', () => {
    writeLog('Starting service list verification');
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES}`);
    
    // Verify service name exists in the list using specific table row lookup
    findRowByName(TABLE_SELECTORS.TABLE, serviceName)
      .should('not.be.null')
      .and('be.visible');
    writeLog('Service found in list');
  });

  after(() => {
    return KongManager.deleteService(serviceName);
  });
});

describe('Route List Verification', () => {
  const serviceName = 'ListVerifyRouteService';
  const routeName = 'ListVerifyRoute';

  before(() => {
    // Create service and route
    return KongManager.createService(Cypress.env('mockServerHttp'), { name: serviceName }).then((id) => {
      return KongManager.createRoute(id, { name: routeName, path: '/listverify' });
    });
  });

  it('should display the created route in the route list', () => {
    writeLog('Starting route list verification');
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.ROUTES}`);
    
    // Verify route name exists in the list using specific table row lookup
    findRowByName(TABLE_SELECTORS.TABLE, routeName)
      .should('not.be.null')
      .and('be.visible');
    writeLog('Route found in list');
  });

  after(() => {
    return KongManager.deleteRoute(routeName)
      .then(() => KongManager.deleteService(serviceName));
  });
});
