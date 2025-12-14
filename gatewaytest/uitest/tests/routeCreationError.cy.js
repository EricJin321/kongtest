/**
 * @fileoverview Route creation error handling tests
 * @description Tests validation and error messages for invalid route configurations
 * in Kong Manager UI, including route name validation, path format, and duplicate names.
 */

import KongManager from '../../utils/kongManager.js';
import { fillInput, clickWhenEnabled, selectMultiselectItems } from '../../utils/uiHelpers.js';
import { ROUTE_CREATION_ERRORS } from '../utils/errorCode.js';
import { SERVICE_SELECTORS, ROUTE_SELECTORS } from '../../utils/constants.js';

describe('Route Creation Error Handling', () => {
  const serviceName = 'RouteErrorService';
  let serviceUrl;
  let serviceId;

  before(() => {
    // Create a service to attach routes to
    serviceUrl = Cypress.env('mockServerHttp');
    return KongManager.createService(serviceUrl, { name: serviceName }).then((id) => {
      serviceId = id;
    });
  });

  beforeEach(() => {
    // Navigate to service detail page and click Add Route
    cy.visit(`${Cypress.env('kongManagerUrl')}/default/services/${serviceId}`);
    cy.get(SERVICE_SELECTORS.ADD_ROUTE_BUTTON)
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
    fillInput(ROUTE_SELECTORS.NAME_INPUT, routeName);
    fillInput(ROUTE_SELECTORS.PATH_INPUT, '/MyPath');
    
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);
    
    cy.contains(ROUTE_CREATION_ERRORS.INVALID_ROUTE_NAME(routeName)).should('be.visible');
  });

  it('should show error for invalid Path format (missing leading slash)', () => {
    fillInput(ROUTE_SELECTORS.NAME_INPUT, 'MyRoute');
    fillInput(ROUTE_SELECTORS.PATH_INPUT, 'MyPath');
    
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);
    
    cy.contains(ROUTE_CREATION_ERRORS.INVALID_PATH_FORMAT).should('be.visible');
  });

  it('should show error for invalid Host (incomplete IP 1.1.1)', () => {
    fillInput(ROUTE_SELECTORS.NAME_INPUT, 'ValidRouteName');
    fillInput(ROUTE_SELECTORS.PATH_INPUT, '/validpath');
    // Select GET method
    selectMultiselectItems(() => cy.contains('div', 'Select methods'), ['GET']);
    
    // Fill invalid host
    fillInput(ROUTE_SELECTORS.HOST_INPUT, '1.1.1');
    
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);
    
    // Verify URL did not navigate away
    cy.url().should('include', '/routes/create');
    
    // Verify error message
    cy.contains('p', ROUTE_CREATION_ERRORS.INVALID_HOST_IPV4('1.1.1'))
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Host (# character)', () => {
    fillInput(ROUTE_SELECTORS.NAME_INPUT, 'ValidRouteName');
    fillInput(ROUTE_SELECTORS.PATH_INPUT, '/validpath');
    // Select GET method
    selectMultiselectItems(() => cy.contains('div', 'Select methods'), ['GET']);
    
    // Fill invalid host with # character
    fillInput(ROUTE_SELECTORS.HOST_INPUT, '#host.com');
    
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);
    
    // Verify URL did not navigate away
    cy.url().should('include', '/routes/create');
    
    // Verify error message
    cy.contains('p', ROUTE_CREATION_ERRORS.INVALID_HOST_HOSTNAME('#host.com'))
      .scrollIntoView()
      .should('be.visible');
  });

  it('should show error for invalid Host (Chinese characters)', () => {
    fillInput(ROUTE_SELECTORS.NAME_INPUT, 'ValidRouteName');
    fillInput(ROUTE_SELECTORS.PATH_INPUT, '/validpath');
    // Select GET method
    selectMultiselectItems(() => cy.contains('div', 'Select methods'), ['GET']);
    
    // Fill invalid host with Chinese characters
    fillInput(ROUTE_SELECTORS.HOST_INPUT, '主机.com');
    
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);
    
    // Verify URL did not navigate away
    cy.url().should('include', '/routes/create');
    
    // Verify error message
    cy.contains('p', ROUTE_CREATION_ERRORS.INVALID_HOST_HOSTNAME('主机.com'))
      .scrollIntoView()
      .should('be.visible');
  });
});

describe('Duplicate Route Name Test', () => {
  const serviceName = 'DupRouteService';
  const routeName = 'DuplicateRoute';
  let serviceUrl;
  let serviceId;

  before(() => {
    // Create service and initial route
    serviceUrl = Cypress.env('mockServerHttp');
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
    cy.visit(`${Cypress.env('kongManagerUrl')}/default/routes/create?serviceId=${serviceId}`);
  });

  it('should fail when creating a route with an existing name', () => {
    fillInput(ROUTE_SELECTORS.NAME_INPUT, routeName);
    fillInput(ROUTE_SELECTORS.PATH_INPUT, '/diffPath');
    
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);
    
    cy.contains(ROUTE_CREATION_ERRORS.UNIQUE_CONSTRAINT(routeName)).should('be.visible');
  });
});
