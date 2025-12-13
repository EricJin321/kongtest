/**
 * @fileoverview Error messages and tooltip strings for Kong Manager UI validation
 * @description Centralized constants for expected error messages and field tooltips
 */

// ============================================================================
// Service Creation/Management Error Messages
// ============================================================================

export const SERVICE_CREATION_ERRORS = {
  INVALID_URL: 'The URL must follow a valid format. Example: https://api.kong-air.com/flights',
  INVALID_NAME: 'The name can be any string containing characters, letters, numbers, or the following characters: ., -, _, or ~. Do not use spaces.',
  INVALID_CONN_TIMEOUT: 'schema violation (connect_timeout: value should be between 1 and 2147483646)',
  UNIQUE_CONSTRAINT: (name) => `UNIQUE violation detected on '{name="${name}"}'`,
};

// ============================================================================
// Route Creation/Management Error Messages
// ============================================================================

export const ROUTE_CREATION_ERRORS = {
  INVALID_ROUTE_NAME: (name) => `schema violation (name: invalid value '${name}': the only accepted ascii characters are alphanumerics or ., -, _, and ~)`,
  INVALID_PATH_FORMAT: 'schema violation (paths.1: should start with: / (fixed path) or ~/ (regex path))',
  UNIQUE_CONSTRAINT: (name) => `UNIQUE violation detected on '{name="${name}"}'`,
};

// ============================================================================
// Field Tooltip Strings
// ============================================================================

export const TOOLTIP_STRINGS = {
  SERVICE_NAME: 'The service name.',
  SERVICE_URL: 'The URL of the upstream server.',
  SERVICE_CONNECT_TIMEOUT: 'The timeout in milliseconds for establishing a connection to the upstream server.',
  SERVICE_WRITE_TIMEOUT: 'The timeout in milliseconds between two successive write operations.',
  SERVICE_READ_TIMEOUT: 'The timeout in milliseconds between two successive read operations.',
  
  ROUTE_NAME: 'The route name.',
  ROUTE_PATH: 'The path(s) to match for the route.',
  ROUTE_METHODS: 'A list of HTTP methods that match this route.',
  ROUTE_PROTOCOLS: 'A list of the protocols this route should support.',
  ROUTE_STRIP_PATH: 'When matching a route via one of the paths, strip the matching prefix from the upstream request URL.',
};
