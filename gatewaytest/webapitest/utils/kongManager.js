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
    // Register a scoped fail handler to log any errors that happen during this flow.
    const failHandler = (err) => {
      // Unregister immediately to avoid leaking the handler across tests
      Cypress.off('fail', failHandler);
      try {
        // record error via existing logger (do not modify logger.js as requested)
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

    // Click the Add button using the toolbar anchor directly (simpler and more robust).
    // The page uses an <a data-testid="toolbar-add-gateway-service" ... type="button"> element
    // that contains the svg icon, so click it directly instead of trying to resolve a <button> ancestor.
    cy.get('a[data-testid="toolbar-add-gateway-service"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Verify navigation to the Create Service page occurred
    cy.url({ timeout: 10000 }).should('include', '/default/services/create');
    writeLog('Navigated to /default/services/create');

    // Fill the Full Url input first and log the action
    cy.log(`Filling Full Url: ${fullUrl}`);
    writeLog(`Filling Full Url: ${fullUrl}`);
    cy.get('[data-testid="gateway-service-url-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(fullUrl);

    // Optionally fill the Name input after URL
    if (requestedName) {
      cy.log(`Filling Name: ${requestedName}`);
      writeLog(`Filling Name: ${requestedName}`);
      cy.get('[data-testid="gateway-service-name-input"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(requestedName);
    }

    // Click Save
    cy.get('[data-testid="service-create-form-submit"]', { timeout: 10000 })
      .should('be.enabled')
      .click();
    // After save, Kong Manager navigates to /default/services/<guid>
    // Add logs to trace progress so we can see whether the flow reaches the logging step
    cy.log('Save clicked - waiting for redirect to service detail');

    return cy.url({ timeout: 20000 }).should('match', /\/default\/services\/[A-Za-z0-9-]+/).then((u) => {
      cy.log('Redirect detected, extracting id');
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

    // Find the row for the service by displayed name
    cy.contains('td[data-testid="name"] b', serviceName, { timeout: 15000 })
      .should('be.visible')
      .closest('tr')
      .as('serviceRow');

    // Click the actions dropdown trigger in that row (target the first trigger inside the matched row)
    cy.get('@serviceRow').then(($row) => {
      const $trigger = $row.find('button[data-testid="row-actions-dropdown-trigger"]');
      if ($trigger && $trigger.length) {
        cy.wrap($trigger.first()).click({ force: true });
      } else {
        // Fallback: click the first global trigger (best-effort)
        cy.get('button[data-testid="row-actions-dropdown-trigger"]', { timeout: 10000 }).first().click({ force: true });
      }
    });

    // Click the Delete action in the dropdown — choose the first visible delete button to avoid multiple matches
    cy.get('button[data-testid="action-entity-delete"]', { timeout: 10000 })
      .filter(':visible')
      .first()
      .click({ force: true });

    // Type the service name into the confirmation input and confirm
    cy.get('input[data-testid="confirmation-input"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(serviceName);

    cy.get('button[data-testid="modal-action-button"]', { timeout: 10000 })
      .should('not.be.disabled')
      .click({ force: true });

    // Wait for the row to be removed from the table
    cy.contains('td[data-testid="name"] b', serviceName, { timeout: 15000 }).should('not.exist');
  }
}

export default KongManager;
