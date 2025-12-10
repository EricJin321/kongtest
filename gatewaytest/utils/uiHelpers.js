/**
 * Shared UI helper utilities for Cypress tests.
 * These helpers encapsulate common UI interaction patterns to reduce code duplication.
 */

/**
 * Fill an input field with a value.
 * Ensures visibility, optionally scrolls into view, clears existing content, and types new value.
 * 
 * @param {string} selector - CSS selector for the input element
 * @param {string} value - Value to type into the input
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @param {boolean} opts.clear - Whether to clear existing content first (default: true)
 * @param {boolean} opts.scroll - Whether to scroll into view first (default: true)
 * @returns {Cypress.Chainable}
 */
export function fillInput(selector, value, opts = {}) {
  const { timeout = 10000, clear = true, scroll = true } = opts;
  
  return cy.get(selector, { timeout }).then(($el) => {
    if (scroll) {
      cy.wrap($el).scrollIntoView();
    }
    
    cy.wrap($el).should('be.visible');
    
    if (clear) {
      cy.wrap($el).clear();
    }
    
    cy.wrap($el).type(value);
  });
}

/**
 * Click an element after ensuring it's visible and enabled.
 * 
 * @param {string} selector - CSS selector for the element
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @param {boolean} opts.scroll - Whether to scroll into view first (default: true)
 * @param {boolean} opts.checkEnabled - Whether to check enabled state (default: true)
 * @param {boolean} opts.force - Whether to force click (default: true)
 * @returns {Cypress.Chainable}
 */
export function clickWhenEnabled(selector, opts = {}) {
  const { timeout = 10000, scroll = true, checkEnabled = true, force = true } = opts;
  
  return cy.get(selector, { timeout }).then(($el) => {
    if (scroll) {
      cy.wrap($el).scrollIntoView();
    }
    cy.wrap($el).should('be.visible');
    if (checkEnabled) {
      cy.wrap($el).should('be.enabled');
    }
    cy.wrap($el).click({ force });
  });
}

/**
 * Select multiple items from a multiselect dropdown.
 * Opens the multiselect, then clicks each item's button.
 * 
 * @param {Function} opener - Function that returns the opener element (e.g., () => cy.contains('div', 'Select methods'))
 * @param {Array<string>} items - Array of item values to select
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @param {string} opts.itemTestidPrefix - Prefix for item data-testid (default: 'multiselect-item-')
 * @returns {Cypress.Chainable}
 */
export function selectMultiselectItems(opener, items = [], opts = {}) {
  const { timeout = 10000, itemTestidPrefix = 'multiselect-item-' } = opts;
  
  // Open the multiselect
  opener().click({ force: true });
  
  // Select each item
  items.forEach((item) => {
    const itemSelector = `[data-testid="${itemTestidPrefix}${item}"]`;
    cy.get(itemSelector, { timeout })
      .should('exist')
      .within(() => {
        cy.get('button').click({ force: true });
      });
  });
  
  // Close the dropdown by pressing Escape key
  cy.get('body').type('{esc}');
  
  return cy.wrap(null); // Return chainable
}

/**
 * Ensure a checkbox is in the desired state (checked or unchecked).
 * Only clicks if the current state doesn't match the desired state.
 * 
 * @param {string} selector - CSS selector for the checkbox input
 * @param {boolean} checked - Desired state (true = checked, false = unchecked)
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @returns {Cypress.Chainable}
 */
export function ensureCheckbox(selector, checked = true, opts = {}) {
  const { timeout = 10000 } = opts;
  
  return cy.get(selector, { timeout }).then(($inp) => {
    // Check current state (support both native checked property and aria-checked attribute)
    const isChecked = ($inp.prop('checked') === true) || ($inp.attr('aria-checked') === 'true');
    
    // Only click if state needs to change
    if (checked && !isChecked) {
      cy.wrap($inp).click({ force: true });
    } else if (!checked && isChecked) {
      cy.wrap($inp).click({ force: true });
    }
  });
}

/**
 * Find a row in a table by exact name match.
 * 
 * @param {string} tableSelector - Selector for the table element
 * @param {string} name - Exact name to match
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 15000)
 * @param {string} opts.nameCellSelector - Selector for name cell within row (default: 'td[data-testid="name"] b')
 * @returns {Cypress.Chainable<JQuery>} The matched row element
 */
export function findRowByName(tableSelector, name, opts = {}) {
  const { timeout = 15000, nameCellSelector = 'td[data-testid="name"] b' } = opts;
  
  return cy.get(tableSelector, { timeout }).then(($tables) => {
    const $table = $tables.first()[0];
    const rows = $table ? $table.querySelectorAll('tbody tr') : [];
    
    const matched = Array.from(rows).find((el) => {
      const nameCell = el.querySelector(nameCellSelector);
      return nameCell && nameCell.textContent && nameCell.textContent.trim() === name;
    });
    
    if (!matched) {
      throw new Error(`Row not found for name: ${name}`);
    }
    
    return cy.wrap(matched);
  });
}

/**
 * Find a row by name and delete it through the row actions dropdown.
 * Handles: finding row → opening dropdown → clicking delete → typing confirmation → confirming deletion → waiting for removal.
 * 
 * @param {string} tableSelector - Selector for the table element
 * @param {string} name - Exact name of the entity to delete
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 15000)
 * @param {string} opts.nameCellSelector - Selector for name cell (default: 'td[data-testid="name"] b')
 * @param {string} opts.rowActionTriggerSelector - Selector for row actions button (default: 'button[data-testid="row-actions-dropdown-trigger"]')
 * @param {string} opts.deleteActionSelector - Selector for delete action button (default: 'button[data-testid="action-entity-delete"]')
 * @param {string} opts.confirmationInputSelector - Selector for confirmation input (default: 'input[data-testid="confirmation-input"]')
 * @param {string} opts.modalActionButtonSelector - Selector for modal confirm button (default: 'button[data-testid="modal-action-button"]')
 * @returns {Cypress.Chainable}
 */
export function findAndDeleteRow(tableSelector, name, opts = {}) {
  const {
    timeout = 15000,
    nameCellSelector = 'td[data-testid="name"] b',
    rowActionTriggerSelector = 'button[data-testid="row-actions-dropdown-trigger"]',
    deleteActionSelector = 'button[data-testid="action-entity-delete"]',
    confirmationInputSelector = 'input[data-testid="confirmation-input"]',
    modalActionButtonSelector = 'button[data-testid="modal-action-button"]'
  } = opts;
  
  return findRowByName(tableSelector, name, { timeout, nameCellSelector }).then(($matchedRow) => {
    // Open row actions dropdown
    cy.wrap($matchedRow)
      .find(rowActionTriggerSelector)
      .first()
      .click({ force: true });
    
    // Click delete action
    cy.get(deleteActionSelector, { timeout: 10000 })
      .filter(':visible')
      .first()
      .click({ force: true });
    
    // Type confirmation name
    cy.get(confirmationInputSelector, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(name);
    
    // Confirm deletion
    cy.get(modalActionButtonSelector, { timeout: 10000 })
      .should('not.be.disabled')
      .click({ force: true });
    
    // Wait for row to disappear
    return cy.contains(nameCellSelector, name, { timeout }).should('not.exist');
  });
}

/**
 * Click a sidebar item, handling the sidebar toggle if necessary.
 * 
 * @param {string} itemName - The name of the sidebar item to click (e.g., 'Gateway Services')
 */
export function clickSidebarItem(itemName) {
  // Wait for DOM to stabilize after navigation
  cy.wait(1000);
  cy.get('body').then(($body) => {
    const toggle = $body.find('.sidebar-menu-toggle');
    if (toggle.length > 0 && toggle.is(':visible')) {
      cy.wrap(toggle).click();
      // Wait for sidebar animation to complete
      cy.wait(500);
    }
  });
  
  cy.contains('.sidebar-item-name', itemName).should('be.visible').click();
}
