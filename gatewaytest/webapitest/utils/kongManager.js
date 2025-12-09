import { writeLog } from './logger.js';

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
    // Scoped fail handler: log then rethrow
    const failHandler = (err) => {
      // Unregister immediately to avoid leaking the handler across tests
      Cypress.off('fail', failHandler);
      try {
        // record error via existing logger
        writeLog(`KongManager.createService failed: ${err && err.message ? err.message : err}`);
      } catch (e) {
        // swallow logger errors to avoid masking original error
        /* intentionally empty */
      }
      // rethrow so Cypress still fails the test
      throw err;
    };
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
    cy.get('[data-testid="gateway-service-url-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(fullUrl);

    // Optionally fill Name
    if (requestedName) {
      cy.log(`Filling Name: ${requestedName}`);
      writeLog(`Filling Name: ${requestedName}`);
      cy.get('[data-testid="gateway-service-name-input"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(requestedName);
    }

    // Submit form
    cy.get('[data-testid="service-create-form-submit"]', { timeout: 10000 })
      .should('be.enabled')
      .click();
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

    const failHandler = (err) => {
      Cypress.off('fail', failHandler);
      try {
        writeLog(`KongManager.createRoute failed for service ${serviceId}: ${err && err.message ? err.message : err}`);
      } catch (e) {
        /* ignore logger errors */
      }
      throw err;
    };
    Cypress.on('fail', failHandler);

    // Visit the service page and click Add a Route
    cy.visit(visitUrl);
    cy.get('button.add-route-btn', { timeout: 10000 }).should('be.visible').click({ force: true });

    // Verify navigation to create-route page
    cy.url({ timeout: 15000 }).should('include', '/default/routes/create');
    cy.url().should('include', `serviceId=${serviceId}`);

    // Fill route name and path (scroll into view)
    cy.get('[data-testid="route-form-name"]', { timeout: 10000 }).scrollIntoView().should('be.visible').clear().type(routeName);
    cy.get('[data-testid="route-form-paths-input-1"]', { timeout: 10000 }).scrollIntoView().should('be.visible').clear().type(routePath);

    // Open Methods multiselect and select requested methods
    if (methodsToSelect.length > 0) {
      cy.contains('div', 'Select methods', { timeout: 10000 }).click({ force: true });
      // select each requested method by its testid (e.g. multiselect-item-GET)
      methodsToSelect.forEach((m) => {
        const tid = `multiselect-item-${m}`;
        cy.get(`[data-testid="${tid}"]`, { timeout: 10000 })
          .should('exist')
          .within(() => {
            cy.get('button').click({ force: true });
          });
      });
    }

    // Ensure the "Strip Path" checkbox matches the requested value.
    // Default behavior: stripPath === true -> checkbox checked.
    // The checkbox input uses `data-testid="route-form-strip-path"` per app markup.
    cy.get('input[data-testid="route-form-strip-path"]', { timeout: 10000 })
      .then(($inp) => {
        // Determine current state: prefer `prop('checked')`, fall back to `aria-checked` when present
        const isChecked = ($inp.prop('checked') === true) || ($inp.attr('aria-checked') === 'true');
        if (stripPath && !isChecked) {
          cy.wrap($inp).click({ force: true });
        } else if (!stripPath && isChecked) {
          cy.wrap($inp).click({ force: true });
        }
      });

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
    cy.get('[data-testid="route-create-form-submit"]', { timeout: 10000 })
      .should('be.enabled')
      .click({ force: true });

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

    // Scoped fail handler to log deletion errors
    const failHandler = (err) => {
      Cypress.off('fail', failHandler);
      try {
        writeLog(`KongManager.deleteService failed for ${serviceName}: ${err && err.message ? err.message : err}`);
      } catch (e) {
        /* ignore logger errors */
      }
      throw err;
    };
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // New robust flow: find the table rows, pick the row with the exact name match,
    // then perform row-scoped actions to open the dropdown, click Delete, confirm and wait for removal.
    return cy.get('table[data-tableid], table', { timeout: 15000 }).then(($tables) => {
      const $table = $tables.first()[0];
      const rows = $table ? $table.querySelectorAll('tbody tr') : [];
      const matched = Array.from(rows).find((el) => {
        const nameCell = el.querySelector('td[data-testid="name"] b');
        return nameCell && nameCell.textContent && nameCell.textContent.trim() === serviceName;
      });

      if (!matched) {
        Cypress.off('fail', failHandler);
        throw new Error(`Service row not found for name: ${serviceName}`);
      }

      return cy.wrap(matched).then(($matchedRow) => {
        cy.wrap($matchedRow)
          .find('button[data-testid="row-actions-dropdown-trigger"]')
          .first()
          .click({ force: true });

        cy.get('button[data-testid="action-entity-delete"]', { timeout: 10000 })
          .filter(':visible')
          .first()
          .click({ force: true });

        cy.get('input[data-testid="confirmation-input"]', { timeout: 10000 })
          .should('be.visible')
          .clear()
          .type(serviceName);

        cy.get('button[data-testid="modal-action-button"]', { timeout: 10000 })
          .should('not.be.disabled')
          .click({ force: true });

        return cy.contains('td[data-testid="name"] b', serviceName, { timeout: 15000 }).should('not.exist');
      });
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

    const failHandler = (err) => {
      Cypress.off('fail', failHandler);
      try {
        writeLog(`KongManager.deleteRoute failed for ${routeName}: ${err && err.message ? err.message : err}`);
      } catch (e) {
        /* ignore logger errors */
      }
      throw err;
    };
    Cypress.on('fail', failHandler);

    cy.visit(visitUrl);

    // Find the routes table, locate the row with exact name match, then delete via row actions
    return cy.get('table[data-tableid], table', { timeout: 15000 }).then(($tables) => {
      const $table = $tables.first()[0];
      const rows = $table ? $table.querySelectorAll('tbody tr') : [];
      const matched = Array.from(rows).find((el) => {
        const nameCell = el.querySelector('td[data-testid="name"] b');
        return nameCell && nameCell.textContent && nameCell.textContent.trim() === routeName;
      });

      if (!matched) {
        Cypress.off('fail', failHandler);
        return;
        //throw new Error(`Route row not found for name: ${routeName}`);
      }

      return cy.wrap(matched).then(($matchedRow) => {
        cy.wrap($matchedRow)
          .find('button[data-testid="row-actions-dropdown-trigger"]')
          .first()
          .click({ force: true });

        cy.get('button[data-testid="action-entity-delete"]', { timeout: 10000 })
          .filter(':visible')
          .first()
          .click({ force: true });

        cy.get('input[data-testid="confirmation-input"]', { timeout: 10000 })
          .should('be.visible')
          .clear()
          .type(routeName);

        cy.get('button[data-testid="modal-action-button"]', { timeout: 10000 })
          .should('not.be.disabled')
          .click({ force: true });

        return cy.contains('td[data-testid="name"] b', routeName, { timeout: 15000 }).should('not.exist');
      });
    });
  }
}

export default KongManager;
