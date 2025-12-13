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
  // Service - Basic Fields
  SERVICE_URL: 'This is the URL of the API you will manage in Kong Gateway.',
  SERVICE_NAME: 'The Service name.',
  
  // Service - Advanced Fields
  SERVICE_RETRIES: 'The number of retries to execute upon failure to proxy.',
  SERVICE_CONN_TIMEOUT: 'The timeout in milliseconds for establishing a connection to the upstream server.',
  SERVICE_WRITE_TIMEOUT: 'The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server.',
  SERVICE_READ_TIMEOUT: 'The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server.',
  SERVICE_CLIENT_CERT: 'Certificate to be used as client certificate while TLS handshaking to the upstream server.',
  SERVICE_CA_CERTS: 'Array of CA Certificate object UUIDs that are used to build the trust store while verifying upstream server\'s TLS certificate. If set to null when Nginx default is respected. If default CA list in Nginx are not specified and TLS verification is enabled, then handshake with upstream server will always fail (because no CA are trusted).',
  SERVICE_TLS_VERIFY: 'Whether to enable verification of upstream server TLS certificate. If set to null, then the Nginx default is respected.',
  SERVICE_TAGS: 'An optional set of strings associated with the Service for grouping and filtering.',
  
  // Service - Manual Configuration Mode
  SERVICE_PROTOCOL: 'The protocol used to communicate with the upstream.',
  SERVICE_HOST: 'The host of the upstream server. Note that the host value is case sensitive.',
  SERVICE_PATH: 'The path to be used in request to the upstream server.',
  SERVICE_PORT: 'The upstream server port.',
  
  // Route Fields
  ROUTE_NAME: 'The route name.',
  ROUTE_PATH: 'The path(s) to match for the route.',
  ROUTE_METHODS: 'A list of HTTP methods that match this route.',
  ROUTE_PROTOCOLS: 'A list of the protocols this route should support.',
  ROUTE_STRIP_PATH: 'When matching a route via one of the paths, strip the matching prefix from the upstream request URL.',
};
