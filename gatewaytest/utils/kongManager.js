import { writeLog } from './logger.js';
import {
  fillInput,
  clickWhenEnabled,
  selectMultiselectItems,
  ensureCheckbox,
  findAndDeleteRow
} from './uiHelpers.js';

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
    const visitUrl = options.visitUrl || 'http://localhost:8002/default/services';
    const requestedName = options.name || null;
    writeLog('OpenUrl: ' + visitUrl, 'DEBUG');
    
    const failHandler = createFailHandler('KongManager.createService');
    Cypress.on('fail', failHandler);

    // Visit the services page
    cy.visit(visitUrl);

    // Click the Add toolbar anchor — prefer the toolbar button, fallback to empty-state anchor.
    // Use a combined selector and wait for at least one to be visible to handle async rendering.
    const createServiceSelector = 'a[data-testid="toolbar-add-gateway-service"], a[data-testid="empty-state-action"], a.k-button.medium.primary[href="/default/services/create"]';
    cy.get(createServiceSelector, { timeout: 10000 })
      .should(($els) => {
        expect($els.filter(':visible').length).to.be.gt(0, 'Expected create service button to be visible');
      })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Verify navigation to the Create Service page occurred
    cy.url({ timeout: 10000 }).should('include', '/default/services/create');
    writeLog('Navigated to /default/services/create', 'DEBUG');

    // Fill Full Url
    cy.log(`Filling Full Url: ${fullUrl}`);
    writeLog(`Filling Full Url: ${fullUrl}`, 'DEBUG');
    fillInput('[data-testid="gateway-service-url-input"]', fullUrl, { scroll: false });

    // Optionally fill Name
    if (requestedName) {
      cy.log(`Filling Name: ${requestedName}`);
      writeLog(`Filling Name: ${requestedName}`, 'DEBUG');
      fillInput('[data-testid="gateway-service-name-input"]', requestedName, { scroll: false });
    }

    // Submit form
    clickWhenEnabled('[data-testid="service-create-form-submit"]', { force: false });
    cy.log('Save clicked - waiting for redirect to service detail');

    // Wait specifically for a UUID-like GUID in the URL path to avoid matching '/create'
    const guidPathRegex = /\/default\/services\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return cy.url({ timeout: 30000 })
      .should('match', guidPathRegex)
      .then((u) => {
        cy.log('Redirect detected to service detail, extracting id');
        writeLog(`current url after creation: ${u}`, 'DEBUG');
        const parts = u.split('/');
        const id = parts[parts.length - 1];
        writeLog(`Created Kong service ${id}`);
        // Unregister the fail handler now that flow succeeded
        Cypress.off('fail', failHandler);
        // Return the created id; caller (spec) should alias id/name if desired
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
   * @param {Array<string>} options.methods - list of HTTP methods to select (e.g. ['GET','POST'])
   * @param {string} options.protocols - protocol to select (e.g. 'HTTPS', 'HTTP')
   * @returns {Cypress.Chainable<string>} resolves to current URL after route creation steps
   */
  static createRoute(serviceId, options = {}, stripPath = true) {
    const visitUrl = options.visitUrl || `http://localhost:8002/default/services/${serviceId}`;
    const routeName = options.name || 'BasicRoute';
    const routePath = options.path || 'testbasic';
    const methodsToSelect = options.methods || [];
    const protocolToSelect = options.protocols || null;
    const httpRedirectCode = options.httpRedirectCode || null;
    writeLog('OpenUrl: ' + visitUrl, 'DEBUG');

    const failHandler = createFailHandler('KongManager.createRoute', `service ${serviceId}`);
    Cypress.on('fail', failHandler);

    // Visit the service page and click Add a Route
    cy.visit(visitUrl);
    cy.get('button.add-route-btn', { timeout: 10000 }).should('be.visible').click({ force: true });

    // Verify navigation to create-route page
    cy.url({ timeout: 15000 }).should('include', '/default/routes/create');
    cy.url().should('include', `serviceId=${serviceId}`);

    // Fill route name and path (scroll into view)
    fillInput('[data-testid="route-form-name"]', routeName);
    fillInput('[data-testid="route-form-paths-input-1"]', routePath);

    // Open Methods multiselect and select requested methods
    if (methodsToSelect.length > 0) {
      selectMultiselectItems(() => cy.contains('div', 'Select methods', { timeout: 10000 }), methodsToSelect);
    }

    // Ensure the "Strip Path" checkbox matches the requested value.
    ensureCheckbox('input[data-testid="route-form-strip-path"]', stripPath);

    // If protocols option or http redirect code is specified, switch to Advanced mode
    if (protocolToSelect || httpRedirectCode) {
      // Click on the Advanced radio button (click label for compatibility)
      cy.get('input[data-testid="route-form-config-type-advanced"]', { timeout: 10000 })
        .scrollIntoView()
        .should('exist')
        .then(() => {
          cy.get('label[data-testid="route-form-config-type-advanced-label"]', { timeout: 10000 })
            .click({ force: true });
        });
    }

    // If a protocol is requested, open protocols dropdown and select it
    if (protocolToSelect) {
      cy.get('input[data-testid="route-form-protocols"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });

      cy.contains('span.select-item-label', protocolToSelect, { timeout: 10000 })
        .should('exist')
        .then(($span) => {
          if ($span.length === 0) {
            throw new Error(`Protocol ${protocolToSelect} not found in dropdown`);
          }
          cy.wrap($span).click({ force: true });
        });
    }

    // If httpRedirectCode is specified, open the redirect status dropdown and select the matching code
    if (httpRedirectCode) {
      // Click the status code input to open the dropdown
      cy.get('input[data-testid="route-form-http-redirect-status-code"]', { timeout: 10000 })
        .scrollIntoView()
        .should('exist')
        .click({ force: true });

      // Select the status code label from the dropdown
      cy.contains('span.select-item-label', String(httpRedirectCode), { timeout: 10000 })
        .should('exist')
        .then(($el) => {
          if ($el.length === 0) throw new Error(`HTTP redirect code ${httpRedirectCode} not found`);
          cy.wrap($el).click({ force: true });
        });
    }

    // Submit route form
    clickWhenEnabled('[data-testid="route-create-form-submit"]');

    // After save, return current URL
    cy.log('Save clicked - waiting for redirect after route creation');
    return cy.url({ timeout: 30000 }).then((u) => {
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
    const visitUrl = options.visitUrl || 'http://localhost:8002/default/services';
    writeLog(`Deleting service ${serviceName}`);

    const failHandler = createFailHandler('KongManager.deleteService', serviceName);
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Use helper to find row by name and delete it
    return findAndDeleteRow('table[data-tableid], table', serviceName).then((deleted) => {
      if (deleted) {
        writeLog(`Deleted service ${serviceName}`);
      } else {
        writeLog(`Service ${serviceName} not found for deletion`, 'WARN');
      }
      Cypress.off('fail', failHandler);
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
    const visitUrl = options.visitUrl || 'http://localhost:8002/default/routes';
    writeLog(`Deleting route ${routeName}`);

    const failHandler = createFailHandler('KongManager.deleteRoute', routeName);
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Use helper to find row by name and delete it
    return findAndDeleteRow('table[data-tableid], table', routeName)
      .then((deleted) => {
        if (deleted) {
          writeLog(`Deleted route ${routeName}`);
        } else {
          writeLog(`Route ${routeName} not found for deletion`, 'WARN');
        }
        Cypress.off('fail', failHandler);
      });
  }
}

export default KongManager;
