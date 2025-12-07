const fs = require('fs');
const path = require('path');

/**
 * Load endpoints configuration from JSON file
 * @returns {object} Configuration object
 */
function loadConfig() {
  const configPath = path.join(__dirname, '../../cypress/fixtures/config/endpoints.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

/**
 * Build base URL with protocol, hostname and port (pure function)
 * @param {object} config - Configuration object with environments and portPerProtocol
 * @param {string} environment - Environment name ('local', 'staging', 'production')
 * @param {string} protocol - Protocol name ('http', 'https')
 * @returns {string} Complete URL with protocol, hostname and port
 */
function buildBaseUrl(config, environment, protocol) {
  const hostname = config.environments[environment];
  const port = config.portPerProtocol[protocol];
  
  if (!hostname) {
    throw new Error(`Environment "${environment}" not found in config`);
  }
  if (!port) {
    throw new Error(`Port for protocol "${protocol}" not found in config`);
  }
  
  return `${protocol}://${hostname}:${port}`;
}

module.exports = {
  loadConfig,
  buildBaseUrl,
};
