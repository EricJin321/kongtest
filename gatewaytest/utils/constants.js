/**
 * @fileoverview Centralized constants for Kong Manager UI automation
 * @description This file contains all CSS selectors, URL paths, and patterns used across test files
 * to maintain consistency and make updates easier. Organized by UI component/page.
 */

// ============================================================================
// Service Management Selectors
// ============================================================================

export const SERVICE_SELECTORS = {
  // Service List Page
  CREATE_SERVICE_BUTTON: 'a[data-testid="toolbar-add-gateway-service"], a[data-testid="empty-state-action"], a.k-button.medium.primary[href="/default/services/create"]',
  
  // Service Creation Form
  URL_INPUT: '[data-testid="gateway-service-url-input"]',
  NAME_INPUT: '[data-testid="gateway-service-name-input"]',
  SUBMIT_BUTTON: '[data-testid="service-create-form-submit"]',
  
  // Service Detail Page
  ADD_ROUTE_BUTTON: 'button.add-route-btn',
};

// ============================================================================
// Route Management Selectors
// ============================================================================

export const ROUTE_SELECTORS = {
  // Route List Page
  EMPTY_STATE_ACTION: 'a[data-testid="empty-state-action"], a[href="/default/routes/create"]',
  
  // Route Creation Form
  NAME_INPUT: '[data-testid="route-form-name"]',
  PATH_INPUT: '[data-testid="route-form-paths-input-1"]',
  METHODS_MULTISELECT: 'div:contains("Select methods")',
  STRIP_PATH_CHECKBOX: 'input[data-testid="route-form-strip-path"]',
  
  // Advanced Configuration
  CONFIG_TYPE_ADVANCED_RADIO: 'input[data-testid="route-form-config-type-advanced"]',
  CONFIG_TYPE_ADVANCED_LABEL: 'label[data-testid="route-form-config-type-advanced-label"]',
  PROTOCOLS_DROPDOWN: 'input[data-testid="route-form-protocols"]',
  HTTP_REDIRECT_STATUS_DROPDOWN: 'input[data-testid="route-form-http-redirect-status-code"]',
  
  // Submit
  SUBMIT_BUTTON: '[data-testid="route-create-form-submit"]',
};

// ============================================================================
// Common Table Selectors
// ============================================================================

export const TABLE_SELECTORS = {
  TABLE: 'table[data-tableid], table',
  ROW: 'tr',
  DELETE_BUTTON: 'button[data-testid="dropdown-delete-item"]',
  CONFIRM_DELETE: 'button[data-testid="modal-confirm-button"]',
};

// ============================================================================
// Sidebar Navigation Selectors
// ============================================================================

export const SIDEBAR_SELECTORS = {
  MENU_ITEM: 'a.sidebar-item',
};

// ============================================================================
// URL Paths
// ============================================================================

export const URL_PATHS = {
  OVERVIEW: '/default/overview',
  SERVICES: '/default/services',
  SERVICES_CREATE: '/default/services/create',
  ROUTES: '/default/routes',
  ROUTES_CREATE: '/default/routes/create',
};

// ============================================================================
// URL Patterns (Regex)
// ============================================================================

export const URL_PATTERNS = {
  SERVICE_DETAIL_GUID: /\/default\/services\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
};
