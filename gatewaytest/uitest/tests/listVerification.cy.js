import KongManager from '../../utils/kongManager.js';
import { writeLog } from '../../utils/logger.js';
import { findRowByName } from '../../utils/uiHelpers.js';

describe('Service List Verification', () => {
  const serviceName = 'ListVerifyService';

  before(() => {
    // Create service
    return KongManager.createService('http://mockserver:1080', { name: serviceName });
  });

  it('should display the created service in the service list', () => {
    writeLog('Starting service list verification');
    cy.visit('http://localhost:8002/default/services');
    
    // Verify service name exists in the list using specific table row lookup
    findRowByName('table[data-tableid], table', serviceName)
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
    return KongManager.createService('http://mockserver:1080', { name: serviceName }).then((id) => {
      return KongManager.createRoute(id, { name: routeName, path: '/listverify' });
    });
  });

  it('should display the created route in the route list', () => {
    writeLog('Starting route list verification');
    cy.visit('http://localhost:8002/default/routes');
    
    // Verify route name exists in the list using specific table row lookup
    findRowByName('table[data-tableid], table', routeName)
      .should('not.be.null')
      .and('be.visible');
    writeLog('Route found in list');
  });

  after(() => {
    return KongManager.deleteRoute(routeName)
      .then(() => KongManager.deleteService(serviceName));
  });
});
