import KongManager from '../../utils/kongManager.js';
import { fillInput, clickWhenEnabled } from '../../utils/uiHelpers.js';
import { SERVICE_CREATION_ERRORS } from '../utils/errorCode.js';

describe('Route Creation Error Handling', () => {
  const serviceName = 'RouteErrorService';
  const serviceUrl = 'http://mockserver:1080';
  let serviceId;

  before(() => {
    // Create a service to attach routes to
    KongManager.createService(serviceUrl, { name: serviceName }).then((id) => {
      serviceId = id;
    });
  });

  beforeEach(() => {
    // Navigate to service detail page and click Add Route
    cy.visit(`http://localhost:8002/default/services/${serviceId}`);
    cy.get('button.add-route-btn')
      .should('be.visible')
      .click();
  });

  after(() => {
    // Clean up the service
    if (serviceName) {
      KongManager.deleteService(serviceName);
    }
  });

  it('should show error for invalid Route Name (MyRoute$$)', () => {
    const routeName = 'MyRoute$$';
    fillInput('[data-testid="route-form-name"]', routeName);
    fillInput('[data-testid="route-form-paths-input-1"]', '/MyPath');
    
    clickWhenEnabled('[data-testid="route-create-form-submit"]');
    
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_ROUTE_NAME(routeName)).should('be.visible');
  });

  it('should show error for invalid Path format (missing leading slash)', () => {
    fillInput('[data-testid="route-form-name"]', 'MyRoute');
    fillInput('[data-testid="route-form-paths-input-1"]', 'MyPath');
    
    clickWhenEnabled('[data-testid="route-create-form-submit"]');
    
    cy.contains(SERVICE_CREATION_ERRORS.INVALID_PATH_FORMAT).should('be.visible');
  });
});

describe('Duplicate Route Name Test', () => {
  const serviceName = 'DupRouteService';
  const routeName = 'DuplicateRoute';
  const serviceUrl = 'http://mockserver:1080';
  let serviceId;

  before(() => {
    // Create service and initial route
    return KongManager.createService(serviceUrl, { name: serviceName })
      .then((id) => {
        serviceId = id;
        return KongManager.createRoute(id, { name: routeName, path: '/initialPath' });
      });
  });

  after(() => {
    // Clean up
    return KongManager.deleteRoute(routeName)
      .then(() => KongManager.deleteService(serviceName));
  });

  beforeEach(() => {
    // Navigate directly to create route page for the service
    cy.visit(`http://localhost:8002/default/routes/create?serviceId=${serviceId}`);
  });

  it('should fail when creating a route with an existing name', () => {
    fillInput('[data-testid="route-form-name"]', routeName);
    fillInput('[data-testid="route-form-paths-input-1"]', '/diffPath');
    
    clickWhenEnabled('[data-testid="route-create-form-submit"]');
    
    cy.contains(SERVICE_CREATION_ERRORS.UNIQUE_CONSTRAINT(routeName)).should('be.visible');
  });
});
