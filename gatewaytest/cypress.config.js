const { defineConfig } = require('cypress')
const { loadConfig, buildBaseUrl } = require('./webapitest/utils/configHelper')
const fs = require('fs')
const path = require('path')

// Determine specPattern from TEST_SET env var (default: all)
const getSpecPattern = () => {
  const testSet = process.env.TEST_SET || 'all';
  
    const patterns = {
    all: 'webapitest/tests/**/*.cy.js',
    // comprehensive runs basicService, httpsService and noStripPath specs
    comprehensive: 'webapitest/tests/{regexMatchTest.js,basicService.js,httpsService.js,noStripPath.js,methodNotSupport.js,httpBlockTest.js}',
    // basic runs only basicService spec
    //comprehensive: 'webapitest/tests/httpBlockTest.js',
    basic: 'webapitest/tests/basicService.js',
  };

  return patterns[testSet] || patterns['all'];
};

// Build baseUrl using configHelper
const getBaseUrl = () => {
  const config = loadConfig();
  const env = process.env.ENVIRONMENT || 'local';
  return buildBaseUrl(config, env, 'http');
};

// Parse timeout from TIMEOUT env var (default 5000)
const getTimeout = () => {
  const timeout = process.env.TIMEOUT || '5000';
  return parseInt(timeout);
};

module.exports = defineConfig({
  e2e: {
    // Dynamic test file pattern
    specPattern: getSpecPattern(),
    
    // Dynamic baseUrl
    baseUrl: getBaseUrl(),
    
    // Request timeout
    requestTimeout: getTimeout(),
    
    // Response timeout
    responseTimeout: getTimeout(),
    
    // Allow insecure certificates for Chrome
    chromeWebSecurity: false,
    
    supportFile: 'webapitest/support.js',
    
    setupNodeEvents(on, config) {
      // Node event handlers / tasks
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
