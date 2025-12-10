import { writeLog } from './logger.js';
import {
  fillInput,
  clickWhenEnabled,
  selectMultiselectItems,
  ensureCheckbox,
  findAndDeleteRow
} from '../../utils/uiHelpers.js';

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
      writeLog(`${msg}: ${err && err.message ? err.message : err}`);
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
    writeLog('OpenUrl: ' + visitUrl);
    
    const failHandler = createFailHandler('KongManager.createService');
    Cypress.on('fail', failHandler);

    // Visit the services page
    cy.visit(visitUrl);

    // Click the Add toolbar anchor — prefer the toolbar button, fallback to empty-state anchor.
    // Use a non-throwing DOM lookup so absence of the primary button falls back gracefully.
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const $primary = $body.find('a[data-testid="toolbar-add-gateway-service"]');
      if ($primary && $primary.length) {
        cy.wrap($primary.first()).should('be.visible').click({ force: true });
      } else {
        // Fallback selector: empty state action anchor or the explicit anchor for creating services
        cy.get('a[data-testid="empty-state-action"], a.k-button.medium.primary[href="/default/services/create"]', { timeout: 10000 })
          .should('be.visible')
          .first()
          .click({ force: true });
      }
    });

    // Verify navigation to the Create Service page occurred
    cy.url({ timeout: 10000 }).should('include', '/default/services/create');
    writeLog('Navigated to /default/services/create');

    // Fill Full Url
    cy.log(`Filling Full Url: ${fullUrl}`);
    writeLog(`Filling Full Url: ${fullUrl}`);
    fillInput('[data-testid="gateway-service-url-input"]', fullUrl, { scroll: false });

    // Optionally fill Name
    if (requestedName) {
      cy.log(`Filling Name: ${requestedName}`);
      writeLog(`Filling Name: ${requestedName}`);
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
        writeLog(`current url after creation: ${u}`);
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
    writeLog('OpenUrl: ' + visitUrl);

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

    // If protocols option is specified, switch to Advanced mode and select the protocol
    if (protocolToSelect) {
      // Click on the Advanced radio button
      cy.get('input[data-testid="route-form-config-type-advanced"]', { timeout: 10000 })
        .scrollIntoView()
        .should('exist')
        .then(($radio) => {
          // Click the label instead of the input for better compatibility
          cy.get('label[data-testid="route-form-config-type-advanced-label"]', { timeout: 10000 })
            .click({ force: true });
        });

      // Click on the protocols input field to open the dropdown
      cy.get('input[data-testid="route-form-protocols"]', { timeout: 10000 })
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });

      // Select the specified protocol from the dropdown by matching the label text
      cy.contains('span.select-item-label', protocolToSelect, { timeout: 10000 })
        .should('exist')
        .then(($span) => {
          if ($span.length === 0) {
            throw new Error(`Protocol ${protocolToSelect} not found in dropdown`);
          }
          cy.wrap($span).click({ force: true });
        });
    }

    // Submit route form
    clickWhenEnabled('[data-testid="route-create-form-submit"]');

    // After save, return current URL
    cy.log('Save clicked - waiting for redirect after route creation');
    return cy.url({ timeout: 30000 }).then((u) => {
      writeLog(`current url after route creation: ${u}`);
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

    const failHandler = createFailHandler('KongManager.deleteService', serviceName);
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Use helper to find row by name and delete it
    return findAndDeleteRow('table[data-tableid], table', serviceName).then(() => {
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

    const failHandler = createFailHandler('KongManager.deleteRoute', routeName);
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Use helper to find row by name and delete it
    return findAndDeleteRow('table[data-tableid], table', routeName)
      .then(() => {
        Cypress.off('fail', failHandler);
      });
  }
}

export default KongManager;
