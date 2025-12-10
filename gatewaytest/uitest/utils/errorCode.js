export const SERVICE_CREATION_ERRORS = {
  INVALID_URL: 'The URL must follow a valid format. Example: https://api.kong-air.com/flights',
  INVALID_NAME: 'The name can be any string containing characters, letters, numbers, or the following characters: ., -, _, or ~. Do not use spaces.',
  INVALID_CONN_TIMEOUT: 'schema violation (connect_timeout: value should be between 1 and 2147483646)',
  UNIQUE_CONSTRAINT: (name) => `UNIQUE violation detected on '{name="${name}"}'`,
  INVALID_ROUTE_NAME: (name) => `schema violation (name: invalid value '${name}': the only accepted ascii characters are alphanumerics or ., -, _, and ~)`,
  INVALID_PATH_FORMAT: 'schema violation (paths.1: should start with: / (fixed path) or ~/ (regex path))'
};
