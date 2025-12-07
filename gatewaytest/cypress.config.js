const { defineConfig } = require('cypress')
const { loadConfig, buildBaseUrl } = require('./webapitest/utils/configHelper')
const fs = require('fs')
const path = require('path')

// Get test file pattern based on TEST_SET environment variable
// Usage: TEST_SET=protocol-check npm run test
// or: npm run test:protocol-check
const getSpecPattern = () => {
  const testSet = process.env.TEST_SET || 'all';
  
  const patterns = {
    all: 'webapitest/tests/**/*.cy.js',
    'protocol-check': 'webapitest/tests/protocol-check.cy.js',
    basic: 'webapitest/tests/basic.cy.js',
  };

  return patterns[testSet] || patterns['all'];
};

// Build base URL with hostname and HTTP port from configHelper
const getBaseUrl = () => {
  const config = loadConfig();
  const env = process.env.ENVIRONMENT || 'local';
  return buildBaseUrl(config, env, 'http');
};

// Get timeout settings based on TIMEOUT environment variable
const getTimeout = () => {
  const timeout = process.env.TIMEOUT || '5000';
  return parseInt(timeout);
};

module.exports = defineConfig({
  e2e: {
    // Dynamic test file pattern
    specPattern: getSpecPattern(),
    
    // Dynamic base URL with hostname and HTTP port
    baseUrl: getBaseUrl(),
    
    // Request timeout
    requestTimeout: getTimeout(),
    
    // Response timeout
    responseTimeout: getTimeout(),
    
    // Allow insecure certificates for HTTPS
    chromeWebSecurity: false,
    
    supportFile: 'webapitest/support.js',
    
    setupNodeEvents(on, config) {
      // Task to write logs from Node.js
      on('task', {
        writeLog(message) {
          const logDir = path.join(__dirname, 'cypress/logs');
          const logFile = path.join(logDir, 'test.log');
          
          // Ensure log directory exists
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }
          
          try {
            fs.appendFileSync(logFile, message + '\n', 'utf8');
            return null;
          } catch (error) {
            console.error('Failed to write log:', error);
            return null;
          }
        }
      });
    }
  },
})
