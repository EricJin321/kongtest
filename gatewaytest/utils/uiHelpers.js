/**
 * @fileoverview UI interaction utilities for Cypress tests
 * @description Common helper functions for UI interactions including form filling,
 * button clicks, dropdown/multiselect operations, and configuration access.
 */

import { writeLog } from './logger.js';
import { TIMEOUTS, COMMON_SELECTORS } from './constants.js';

/**
 * Get configuration value from Cypress environment
 * All config values are loaded at startup from endpoints.json
 */
export const Config = {
  get kongManagerUrl() { return Cypress.env('kongManagerUrl'); },
  get mockServerHttp() { return Cypress.env('mockServerHttp'); },
  get mockServerHttps() { return Cypress.env('mockServerHttps'); },
  get pageLoadTimeout() { return Cypress.env('pageLoadTimeout'); },
  get pageNavigationTimeout() { return Cypress.env('pageNavigationTimeout'); },
  get saveOperationTimeout() { return Cypress.env('saveOperationTimeout'); },
  get servicePropagationWaitMs() { return Cypress.env('servicePropagationWaitMs'); },
  get logLevel() { return Cypress.env('logLevel'); }
};

/**
 * Fill an input field with a value.
 * Ensures visibility, optionally scrolls into view, selects all existing content, and types new value.
 * Using selectAll before typing ensures the new value replaces any auto-filled default values.
 * 
 * @param {string} selector - CSS selector for the input element
 * @param {string} value - Value to type into the input
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @param {boolean} opts.clear - Whether to select all content first (default: true)
 * @param {boolean} opts.scroll - Whether to scroll into view first (default: true)
 * @returns {Cypress.Chainable}
 */
export function fillInput(selector, value, opts = {}) {
  const { timeout = TIMEOUTS.DEFAULT, clear = true, scroll = true } = opts;
  
  return cy.get(selector, { timeout }).then(($el) => {
    let chain = cy.wrap($el);
    
    if (scroll) {
      chain = chain.scrollIntoView();
    }
    
    chain = chain.should('be.visible');
    
    if (clear) {
      // Use {selectall} to select existing content, then type to replace it
      // This handles inputs that auto-fill default values after clearing
      chain = chain.type('{selectall}');
    }
    
    return chain.type(value);
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
  const { timeout = TIMEOUTS.DEFAULT, scroll = true, checkEnabled = true, force = false } = opts;
  
  return cy.get(selector, { timeout }).then(($el) => {
    let chain = cy.wrap($el);
    
    if (scroll) {
      chain = chain.scrollIntoView();
    }
    
    chain = chain.should('be.visible');
    
    if (checkEnabled) {
      chain = chain.should('be.enabled');
    }
    
    return chain.click({ force });
  });
}

/**
 * Select a single item from a dropdown.
 * Opens the dropdown input, then clicks the matching item label.
 * 
 * @param {string} inputSelector - Selector for the dropdown input element (e.g., 'input[data-testid="route-form-protocols"]')
 * @param {string} itemValue - The value/text to select (e.g., 'HTTPS', '301')
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @param {string} opts.itemLabelSelector - Selector pattern for item labels (default: 'span.select-item-label')
 * @returns {Cypress.Chainable}
 */
export function selectDropdownItem(inputSelector, itemValue, opts = {}) {
  const { timeout = TIMEOUTS.DEFAULT, itemLabelSelector = 'span.select-item-label' } = opts;
  
  // Open the dropdown
  cy.get(inputSelector, { timeout })
    .scrollIntoView()
    .should('be.visible')
    .click();
  
  // Select the item
  return cy.contains(itemLabelSelector, String(itemValue), { timeout })
    .should('be.visible')
    .click();
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
  const { timeout = TIMEOUTS.DEFAULT, itemTestidPrefix = 'multiselect-item-' } = opts;
  
  // Open the multiselect - ensure visible first for retry mechanism
  opener()
    .should('be.visible')
    .click();
  
  // Select each item using cy.wrap().each() to maintain proper async chaining
  cy.wrap(items).each((item) => {
    // Type item name in the search input to filter and ensure item is visible
    cy.get(COMMON_SELECTORS.MULTISELECT_DROPDOWN_INPUT, { timeout })
      .should('be.visible')
      .clear()
      .type(item);
    
    // Click the filtered item button
    const itemSelector = `[data-testid="${itemTestidPrefix}${item}"] button`;
    cy.get(itemSelector, { timeout })
      .should('be.visible')
      .click();
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
  const { timeout = TIMEOUTS.DEFAULT } = opts;
  
  return cy.get(selector, { timeout }).then(($inp) => {
    // Check current state (support both native checked property and aria-checked attribute)
    const isChecked = ($inp.prop('checked') === true) || ($inp.attr('aria-checked') === 'true');
    
    // Only click if state needs to change
    if (checked && !isChecked) {
      cy.wrap($inp).click();
    } else if (!checked && isChecked) {
      cy.wrap($inp).click();
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
  const { timeout = TIMEOUTS.TABLE_OPERATION, nameCellSelector = COMMON_SELECTORS.NAME_CELL } = opts;
  
  return cy.get(tableSelector, { timeout }).then(($tables) => {
    const $table = $tables.first()[0];
    const rows = $table ? $table.querySelectorAll('tbody tr') : [];
    
    const matched = Array.from(rows).find((el) => {
      const nameCell = el.querySelector(nameCellSelector);
      return nameCell && nameCell.textContent && nameCell.textContent.trim() === name;
    });
    
    // Wrap native DOM element as jQuery object using Cypress.$()
    const $matched = matched ? Cypress.$(matched) : null;
    return cy.wrap($matched);
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
    timeout = TIMEOUTS.TABLE_OPERATION,
    nameCellSelector = COMMON_SELECTORS.NAME_CELL,
    rowActionTriggerSelector = COMMON_SELECTORS.ROW_ACTIONS_TRIGGER,
    deleteActionSelector = COMMON_SELECTORS.ACTION_ENTITY_DELETE,
    confirmationInputSelector = COMMON_SELECTORS.CONFIRMATION_INPUT,
    modalActionButtonSelector = COMMON_SELECTORS.MODAL_ACTION_BUTTON
  } = opts;
  
  return findRowByName(tableSelector, name, { timeout, nameCellSelector }).then(($matchedRow) => {
    if (!$matchedRow) {
      return cy.wrap(false); // Indicate not found/deleted
    }

    // Open row actions dropdown
    cy.wrap($matchedRow)
      .find(rowActionTriggerSelector)
      .first()
      .click();
    
    // Click delete action
    cy.get(deleteActionSelector, { timeout: TIMEOUTS.DEFAULT })
      .filter(':visible')
      .first()
      .click();
    
    // Type confirmation name
    cy.get(confirmationInputSelector, { timeout: TIMEOUTS.DEFAULT })
      .should('be.visible')
      .clear()
      .type(name);
    
    // Confirm deletion
    cy.get(modalActionButtonSelector, { timeout: TIMEOUTS.DEFAULT })
      .should('not.be.disabled')
      .click();
    
    // Wait for row to disappear
    return cy.contains(nameCellSelector, name, { timeout }).should('not.exist').then(() => true); // Indicate deleted
  });
}

/**
 * Click a sidebar item, handling the sidebar toggle if necessary.
 * 
 * @param {string} itemName - The name of the sidebar item to click (e.g., 'Gateway Services')
 */
export function clickSidebarItem(itemName) {
  // Wait for DOM to stabilize after navigation
  // TODO: Need a signal that toggle button is clickable. 
  cy.wait(TIMEOUTS.DOM_STABILIZE);
  cy.get('body').then(($body) => {
    const toggle = $body.find('.sidebar-menu-toggle');
    if (toggle.length > 0 && toggle.is(':visible')) {
      cy.wrap(toggle).click();
      // TODO: need a signal waiting for sidebar animation to complete
      cy.wait(TIMEOUTS.SIDEBAR_ANIMATION);
    }
  });
  
  cy.contains('.sidebar-item-name', itemName).should('be.visible').click();
}

/**
 * Internal helper to verify tooltip display after finding the container and icon.
 * @private
 * @param {Function} getIconChain - Function that returns a fresh Cypress chain to the icon element
 */
function verifyTooltipBehavior(getIconChain, expectedTooltipText, hoverWait) {
  // Get icon and retrieve tooltip ID
  return getIconChain()
    .scrollIntoView()
    .should('be.visible')
    .invoke('attr', 'aria-controls')
    .then((tooltipId) => {
      // Verify the tooltip is initially hidden
      cy.get(`#${tooltipId}`)
        .should('have.css', 'display', 'none');

      // Hover over the icon - use fresh chain from getter
      getIconChain().realHover().wait(hoverWait);

      // Verify the tooltip appears with the expected text
      cy.get(`#${tooltipId}`)
        .should('not.have.css', 'display', 'none')
        .should('be.visible')
        .should('contain.text', expectedTooltipText);
      
      // Move mouse away to hide the tooltip for next verification
      cy.get('body').realHover({ position: 'topLeft' });
      cy.get(`#${tooltipId}`)
        .should('have.css', 'display', 'none');
    });
}

/**
 * Expand a collapse section by clicking its trigger.
 * 
 * @param {string} triggerSelector - Selector for the trigger element (can use data-testid or CSS selector)
 * @param {string} triggerText - The text content of the trigger button (e.g., 'View advanced fields', 'Add tags')
 * @param {object} opts - Options
 * @param {number} opts.timeout - Timeout in ms (default: 10000)
 * @returns {Cypress.Chainable}
 */
export function expandCollapseSection(triggerSelector, triggerText, opts = {}) {
  const { timeout = TIMEOUTS.DEFAULT } = opts;
  
  return cy.get(triggerSelector, { timeout })
    .contains(triggerText)
    .scrollIntoView()
    .should('be.visible')
    .click();
}

/**
 * Field types for tooltip verification
 * @enum {string}
 */
export const FieldType = {
  INPUT: 'input',       // Standard input field (needs .parent().parent())
  SELECT: 'select',     // Select dropdown (needs .parents('.k-select'))
  CHECKBOX: 'checkbox'  // Checkbox field (needs .parents('.k-checkbox'))
};

/**
 * Verify tooltip for a form field's info icon.
 * Works with input, select, checkbox, and other form elements.
 * 
 * @param {string} fieldSelector - data-testid selector for the field element
 * @param {string} expectedTooltipText - The expected text content of the tooltip
 * @param {object} opts - Options
 * @param {number} opts.hoverWait - Time to wait after hovering (default: 500ms)
 * @param {FieldType} opts.fieldType - Type of field (default: FieldType.INPUT)
 * @returns {Cypress.Chainable}
 */
export function verifyFieldTooltip(fieldSelector, expectedTooltipText, opts = {}) {
  const { hoverWait = TIMEOUTS.HOVER_WAIT, fieldType = FieldType.INPUT } = opts;
  
  // Move mouse away first to hide any previous tooltips
  cy.get('body').realHover({ position: 'topLeft' });
  
  let iconSelector = COMMON_SELECTORS.INFO_ICON;
  let containerSelector = `[data-testid="${fieldSelector}"]`;
  let containerModifier = null;
  let useFirst = false;
  
  // Configure based on field type
  switch (fieldType) {
    case FieldType.SELECT:
      containerModifier = (chain) => chain.parents(COMMON_SELECTORS.SELECT_CONTAINER).first();
      useFirst = true; // Select elements may have multiple icons
      break;
      
    case FieldType.CHECKBOX:
      containerModifier = (chain) => chain.parents(COMMON_SELECTORS.CHECKBOX_CONTAINER).first();
      iconSelector = COMMON_SELECTORS.CHECKBOX_INFO_ICON;
      break;
      
    case FieldType.INPUT:
    default:
      containerModifier = (chain) => chain.parent().parent();
      break;
  }
  
  // Create a getter function that returns a fresh chain to the icon
  const getIconChain = () => {
    let chain = cy.get(containerSelector);
    if (containerModifier) {
      chain = containerModifier(chain);
    }
    chain = chain.find(iconSelector);
    if (useFirst) {
      chain = chain.first();
    }
    return chain;
  };
  
  return verifyTooltipBehavior(
    getIconChain,
    expectedTooltipText,
    hoverWait
  );
}