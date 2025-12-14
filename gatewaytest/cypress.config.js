const { defineConfig } = require('cypress')
const { loadConfig, buildBaseUrl } = require('./webapitest/utils/configHelper')
const fs = require('fs')
const path = require('path')

// Determine specPattern from TEST_SET env var (default: all)
const getSpecPattern = () => {
  const testSet = process.env.TEST_SET || 'all';
  
    const patterns = {
    all: '{webapitest/tests/{regexMatchTest.cy.js,basicService.cy.js,httpsService.cy.js,noStripPath.cy.js,methodNotSupport.cy.js,httpBlockTest.cy.js},uitest/tests/{serviceCreationError.cy.js,routeCreationError.cy.js,jumpVerification.cy.js,listVerification.cy.js,serviceCreationInteration.cy.js,serviceBoundaryValues.cy.js}}',
    // all-firefox: all tests except tooltip interaction tests (Firefox doesn't support CDP for cypress-real-events)
    // TODO: Support tooltip tests on Firefox by implementing alternative hover mechanism (e.g., .trigger('mouseover'))
    'all-firefox': '{webapitest/tests/{regexMatchTest.cy.js,basicService.cy.js,httpsService.cy.js,noStripPath.cy.js,methodNotSupport.cy.js,httpBlockTest.cy.js},uitest/tests/{serviceCreationError.cy.js,routeCreationError.cy.js,jumpVerification.cy.js,listVerification.cy.js,serviceBoundaryValues.cy.js}}',
    // comprehensive runs basicService, httpsService and noStripPath specs
    comprehensive: 'webapitest/tests/{regexMatchTest.cy.js,basicService.cy.js,httpsService.cy.js,noStripPath.cy.js,methodNotSupport.cy.js,httpBlockTest.cy.js}',
    // basic runs only basicService spec
    test: 'uitest/tests/serviceCreationError.cy.js',
    basic: 'webapitest/tests/basicService.cy.js',
    ui: 'uitest/tests/{serviceCreationError.cy.js,routeCreationError.cy.js,jumpVerification.cy.js,listVerification.cy.js,serviceCreationInteration.cy.js,serviceBoundaryValues.cy.js}',
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
      // Load test configuration from endpoints.json and inject into Cypress.env
      const endpointsConfig = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'cypress/fixtures/config/endpoints.json'), 'utf8')
      );
      
      // Inject configuration as environment variables
      config.env = {
        ...config.env,
        kongManagerUrl: endpointsConfig.kongManagerUrl,
        mockServerHttp: endpointsConfig.mockServer.http,
        mockServerHttps: endpointsConfig.mockServer.https,
        pageLoadTimeout: endpointsConfig.timeouts.pageLoadTimeout,
        pageNavigationTimeout: endpointsConfig.timeouts.pageNavigationTimeout,
        saveOperationTimeout: endpointsConfig.timeouts.saveOperationTimeout,
        servicePropagationWaitMs: endpointsConfig.servicePropagationWaitMs,
        logLevel: endpointsConfig.logLevel
      };
      
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
      
      // Return the modified config
      return config;
    }
  },
})
