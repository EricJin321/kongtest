/**
 * @fileoverview Kong Manager UI automation helper
 * @description Provides high-level methods for interacting with Kong Manager UI,
 * including service creation, route creation, and resource deletion via UI automation.
 */

import { writeLog } from './logger.js';
import {
  fillInput,
  clickWhenEnabled,
  selectMultiselectItems,
  selectDropdownItem,
  ensureCheckbox,
  findAndDeleteRow,
  Config
} from './uiHelpers.js';
import { SERVICE_SELECTORS, ROUTE_SELECTORS, TABLE_SELECTORS, URL_PATHS, URL_PATTERNS } from './constants.js';

/**
 * Create a scoped fail handler that logs errors and rethrows.
 * @param {string} operation - Description of the operation (e.g., 'createService', 'deleteRoute')
 * @param {string} context - Additional context (e.g., service name, route name)
 * @returns {Function} The fail handler function
 */
function createFailHandler(operation, context = '') {
  const failHandler = (err) => {
    Cypress.off('fail', failHandler);
    try {
      const msg = context ? `${operation} failed for ${context}` : `${operation} failed`;
      writeLog(`${msg}: ${err && err.message ? err.message : err}`, 'ERROR');
    } catch (e) {
      /* ignore logger errors */
    }
    throw err;
  };
  return failHandler;
}

class KongManager {
  /**
   * Create a service in Kong Manager via the UI.
   * @param {string} fullUrl - The URL to set in the Full Url field (e.g. 'http://mockserver:1080')
   * @param {object} options - Optional settings
   * @param {string} options.visitUrl - Kong Manager services page to visit (default: '/default/services')
   * @returns {Cypress.Chainable<string>} resolves to created service id
   */
  static createService(fullUrl, options = {}) {
    const visitUrl = options.visitUrl || `${Config.kongManagerUrl}${URL_PATHS.SERVICES}`;
    const requestedName = options.name || null;
    writeLog('OpenUrl: ' + visitUrl, 'DEBUG');
    
    const failHandler = createFailHandler('KongManager.createService');
    Cypress.on('fail', failHandler);

    // Visit the services page
    cy.visit(visitUrl);

    // Click the Add toolbar anchor — prefer the toolbar button, fallback to empty-state anchor.
    // Use a combined selector and wait for at least one to be visible to handle async rendering.
    cy.get(SERVICE_SELECTORS.CREATE_SERVICE_BUTTON, { timeout: Config.pageLoadTimeout })
      .should(($els) => {
        expect($els.filter(':visible').length).to.be.gt(0, 'Expected create service button to be visible');
      })
      .filter(':visible')
      .first()
      .click();

    // Verify navigation to the Create Service page occurred
    cy.url({ timeout: Config.pageLoadTimeout }).should('include', '/default/services/create');
    writeLog('Navigated to /default/services/create', 'DEBUG');

    // Fill Full Url
    cy.log(`Filling Full Url: ${fullUrl}`);
    writeLog(`Filling Full Url: ${fullUrl}`, 'DEBUG');
    fillInput(SERVICE_SELECTORS.URL_INPUT, fullUrl, { scroll: false });

    // Optionally fill Name
    if (requestedName) {
      cy.log(`Filling Name: ${requestedName}`);
      writeLog(`Filling Name: ${requestedName}`, 'DEBUG');
      fillInput(SERVICE_SELECTORS.NAME_INPUT, requestedName, { scroll: false });
    }

    // Submit form
    clickWhenEnabled(SERVICE_SELECTORS.SUBMIT_BUTTON, { force: false });
    cy.log('Save clicked - waiting for redirect to service detail');

    // Wait specifically for a UUID-like GUID in the URL path to avoid matching '/create'
    return cy.url({ timeout: Config.saveOperationTimeout })
      .should('match', URL_PATTERNS.SERVICE_DETAIL_GUID)
      .then((u) => {
        cy.log('Redirect detected to service detail, extracting id');
        writeLog(`current url after creation: ${u}`, 'DEBUG');
        const parts = u.split('/');
        const id = parts[parts.length - 1];
        writeLog(`Created Kong service ${id}`);
        // Unregister the fail handler now that flow succeeded
        Cypress.off('fail', failHandler);
        // Return the created id wrapped in cy.wrap() to maintain Cypress chain
        return cy.wrap(id);
      });
  }

  /**
   * Create a route for an existing service via the Kong Manager UI.
   * @param {string} serviceId - GUID of the service to attach the route to
   * @param {object} options - Optional settings
   * @param {string} options.visitUrl - service detail page to visit (default: constructed from serviceId)
   * @param {string} options.name - route name (default: 'BasicRoute')
   * @param {string} options.path - route path (default: 'testbasic')
   * @param {Array<string>} options.extraPaths - additional paths to add (requires Advanced mode)
   * @param {Array<string>} options.methods - list of HTTP methods to select (e.g. ['GET','POST'])
   * @param {string} options.protocols - protocol to select (e.g. 'HTTPS', 'HTTP')
   * @returns {Cypress.Chainable<string>} resolves to current URL after route creation steps
   */
  static createRoute(serviceId, options = {}, stripPath = true) {
    const visitUrl = options.visitUrl || `${Config.kongManagerUrl}/default/services/${serviceId}`;
    const routeName = options.name || 'BasicRoute';
    const routePath = options.path || 'testbasic';
    const extraPaths = options.extraPaths || [];
    const methodsToSelect = options.methods || [];
    const protocolToSelect = options.protocols || null;
    const httpRedirectCode = options.httpRedirectCode || null;
    writeLog('OpenUrl: ' + visitUrl, 'DEBUG');

    const failHandler = createFailHandler('KongManager.createRoute', `service ${serviceId}`);
    Cypress.on('fail', failHandler);

    // Visit the service page and click Add a Route
    cy.visit(visitUrl);
    cy.get(SERVICE_SELECTORS.ADD_ROUTE_BUTTON, { timeout: Config.pageLoadTimeout }).should('be.visible').click();

    // Verify navigation to create-route page
    cy.url({ timeout: Config.pageNavigationTimeout }).should('include', URL_PATHS.ROUTES_CREATE);
    cy.url().should('include', `serviceId=${serviceId}`);

    // Fill route name and path (scroll into view)
    fillInput(ROUTE_SELECTORS.NAME_INPUT, routeName);
    fillInput(ROUTE_SELECTORS.PATH_INPUT, routePath);

    // Open Methods multiselect and select requested methods
    if (methodsToSelect.length > 0) {
      selectMultiselectItems(() => cy.contains('div', 'Select methods', { timeout: Config.pageLoadTimeout }), methodsToSelect);
    }

    // Ensure the "Strip Path" checkbox matches the requested value.
    ensureCheckbox(ROUTE_SELECTORS.STRIP_PATH_CHECKBOX, stripPath);

    // If extraPaths, protocols, or http redirect code is specified, switch to Advanced mode
    if (extraPaths.length > 0 || protocolToSelect || httpRedirectCode) {
      // Click on the Advanced radio button (click label for compatibility)
      cy.get(ROUTE_SELECTORS.CONFIG_TYPE_ADVANCED_RADIO, { timeout: Config.pageLoadTimeout })
        .scrollIntoView()
        .should('exist')
        .then(() => {
          cy.get(ROUTE_SELECTORS.CONFIG_TYPE_ADVANCED_LABEL, { timeout: Config.pageLoadTimeout })
            .should('be.visible')
            .click();
        });
    }

    // Add extra paths if provided (after switching to Advanced mode)
    if (extraPaths.length > 0) {
      cy.wrap(extraPaths).each((extraPath, index) => {
        // Click "Add a path" button
        cy.get(ROUTE_SELECTORS.ADD_PATH_BUTTON, { timeout: Config.pageLoadTimeout })
          .should('be.visible')
          .click();
        
        // Fill the additional path input (index + 2 because first path is input-1)
        fillInput(ROUTE_SELECTORS.PATH_INPUT_N(index + 2), extraPath);
      });
    }

    // If a protocol is requested, open protocols dropdown and select it
    if (protocolToSelect) {
      selectDropdownItem(ROUTE_SELECTORS.PROTOCOLS_DROPDOWN, protocolToSelect);
    }

    // If httpRedirectCode is specified, open the redirect status dropdown and select the matching code
    if (httpRedirectCode) {
      selectDropdownItem(ROUTE_SELECTORS.HTTP_REDIRECT_STATUS_DROPDOWN, httpRedirectCode);
    }

    // Submit route form
    clickWhenEnabled(ROUTE_SELECTORS.SUBMIT_BUTTON);

    // After save, return current URL
    cy.log('Save clicked - waiting for redirect after route creation');
    return cy.url({ timeout: Config.saveOperationTimeout }).then((u) => {
      writeLog(`current url after route creation: ${u}`, 'DEBUG');
      writeLog(`Created Kong route ${routeName}`);
      Cypress.off('fail', failHandler);
      return cy.wrap(u);
    });
  }

  /**
   * Delete a service in Kong Manager via the UI using its GUID.
   * @param {string} serviceId - GUID of the service to delete
   * @param {object} options - Optional settings
   * @param {string} options.visitUrl - Kong Manager services page to visit (default: '/default/services')
   * @returns {Cypress.Chainable} resolves when deletion is complete
   */
  static deleteService(serviceName, options = {}) {
    const visitUrl = options.visitUrl || `${Config.kongManagerUrl}${URL_PATHS.SERVICES}`;
    writeLog(`Deleting service ${serviceName}`);

    const failHandler = createFailHandler('KongManager.deleteService', serviceName);
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Use helper to find row by name and delete it
    return findAndDeleteRow(TABLE_SELECTORS.TABLE, serviceName).then((deleted) => {
      if (deleted) {
        writeLog(`Deleted service ${serviceName}`);
      } else {
        writeLog(`Service ${serviceName} not found for deletion`, 'WARN');
      }
      Cypress.off('fail', failHandler);
      return cy.wrap(null);
    });
  }

  /**
   * Delete a route in Kong Manager via the UI by its name.
   * @param {string} routeName - Name of the route to delete
   * @param {object} options - Optional settings
   * @param {string} options.visitUrl - Kong Manager routes page to visit (default: '/default/routes')
   * @returns {Cypress.Chainable} resolves when deletion is complete
   */
  static deleteRoute(routeName, options = {}) {
    const visitUrl = options.visitUrl || `${Config.kongManagerUrl}${URL_PATHS.ROUTES}`;
    writeLog(`Deleting route ${routeName}`);

    const failHandler = createFailHandler('KongManager.deleteRoute', routeName);
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Use helper to find row by name and delete it
    return findAndDeleteRow(TABLE_SELECTORS.TABLE, routeName)
      .then((deleted) => {
        if (deleted) {
          writeLog(`Deleted route ${routeName}`);
        } else {
          writeLog(`Route ${routeName} not found for deletion`, 'WARN');
        }
        Cypress.off('fail', failHandler);
        return cy.wrap(null);
      });
  }
}

export default KongManager;
