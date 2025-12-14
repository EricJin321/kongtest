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
  COLLAPSE_TRIGGER_CONTENT: '[data-testid="collapse-trigger-content"]',
  ADVANCED_FIELDS_COLLAPSE_TRIGGER: '[data-testid="advanced-fields-collapse"] [data-testid="collapse-trigger-content"]',
  TAGS_COLLAPSE_TRIGGER: '[data-testid="tags-collapse"] [data-testid="collapse-trigger-content"]',
  RETRIES_INPUT: '[data-testid="gateway-service-retries-input"]',
  CONN_TIMEOUT_INPUT: '[data-testid="gateway-service-connTimeout-input"]',
  WRITE_TIMEOUT_INPUT: '[data-testid="gateway-service-writeTimeout-input"]',
  READ_TIMEOUT_INPUT: '[data-testid="gateway-service-readTimeout-input"]',
  TAGS_INPUT: '[data-testid="gateway-service-tags-input"]',
  PROTOCOL_RADIO_LABEL: '[data-testid="gateway-service-protocol-radio-label"]',
  PROTOCOL_SELECT: '[data-testid="gateway-service-protocol-select"]',
  HOST_INPUT: '[data-testid="gateway-service-host-input"]',
  PATH_INPUT: '[data-testid="gateway-service-path-input"]',
  PORT_INPUT: '[data-testid="gateway-service-port-input"]',
  CLIENT_CERT_INPUT: '[data-testid="gateway-service-clientCert-input"]',
  CA_CERTS_INPUT: '[data-testid="gateway-service-ca-certs-input"]',
  TLS_VERIFY_CHECKBOX: '[data-testid="gateway-service-tls-verify-checkbox"]',
  
  // Service Detail Page
  ADD_ROUTE_BUTTON: 'button.add-route-btn',
};

// Service field test IDs (for verifyFieldTooltip function which wraps them internally)
export const SERVICE_FIELD_TESTIDS = {
  URL_INPUT: 'gateway-service-url-input',
  NAME_INPUT: 'gateway-service-name-input',
  RETRIES_INPUT: 'gateway-service-retries-input',
  CONN_TIMEOUT_INPUT: 'gateway-service-connTimeout-input',
  WRITE_TIMEOUT_INPUT: 'gateway-service-writeTimeout-input',
  READ_TIMEOUT_INPUT: 'gateway-service-readTimeout-input',
  CLIENT_CERT_INPUT: 'gateway-service-clientCert-input',
  CA_CERTS_INPUT: 'gateway-service-ca-certs-input',
  TLS_VERIFY_CHECKBOX: 'gateway-service-tls-verify-checkbox',
  TAGS_INPUT: 'gateway-service-tags-input',
  PROTOCOL_SELECT: 'gateway-service-protocol-select',
  HOST_INPUT: 'gateway-service-host-input',
  PATH_INPUT: 'gateway-service-path-input',
  PORT_INPUT: 'gateway-service-port-input',
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
  PATH_INPUT_N: (n) => `[data-testid="route-form-paths-input-${n}"]`, // Dynamic path input selector
  ADD_PATH_BUTTON: 'button[data-testid="add-paths"]',
  HOST_INPUT: '[data-testid="route-form-hosts-input-1"]',
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
// Common UI Component Selectors
// ============================================================================

export const COMMON_SELECTORS = {
  // Multiselect Dropdown
  MULTISELECT_DROPDOWN_INPUT: 'input[data-testid="multiselect-dropdown-input"]',
  
  // Modal/Dialog
  MODAL_CONFIRM_BUTTON: 'button[data-testid="modal-confirm-button"]',
  MODAL_ACTION_BUTTON: 'button[data-testid="modal-action-button"]',
  CONFIRMATION_INPUT: 'input[data-testid="confirmation-input"]',
  
  // Table Actions
  NAME_CELL: 'td[data-testid="name"] b',
  ROW_ACTIONS_TRIGGER: 'button[data-testid="row-actions-dropdown-trigger"]',
  ACTION_ENTITY_DELETE: 'button[data-testid="action-entity-delete"]',
  
  // Tooltip
  INFO_ICON: 'label .kui-icon.info-icon[data-testid="kui-icon-wrapper-info-icon"]',
  CHECKBOX_INFO_ICON: '.checkbox-label .kui-icon.info-icon[data-testid="kui-icon-wrapper-info-icon"]',
  
  // Form Field Containers
  SELECT_CONTAINER: '.k-select',
  CHECKBOX_CONTAINER: '.k-checkbox',
};

// ============================================================================
// Timeout Constants (in milliseconds)
// ============================================================================

export const TIMEOUTS = {
  DEFAULT: 10000,
  TABLE_OPERATION: 15000,
  HOVER_WAIT: 500,
  SIDEBAR_ANIMATION: 500,
  DOM_STABILIZE: 1000,
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
