/**
 * @fileoverview Test logging utility
 * @description Provides centralized logging for Cypress tests with configurable log levels
 * and file output via Cypress tasks.
 *
 * @module logger
 * Write log message via Cypress task
 * @param {string} message - Message to log
 * @param {string} level - Log level ('DEBUG', 'INFO', 'WARN', 'ERROR'). Default 'INFO'.
 */
export function writeLog(message, level = 'INFO') {
  const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  return cy.fixture('config/endpoints.json', { log: false }).then((config) => {
    const configuredLevelStr = config.logLevel || 'INFO';
    const configuredLevel = LOG_LEVELS[configuredLevelStr] !== undefined ? LOG_LEVELS[configuredLevelStr] : LOG_LEVELS.INFO;
    const messageLevel = LOG_LEVELS[level] !== undefined ? LOG_LEVELS[level] : LOG_LEVELS.INFO;

    if (messageLevel >= configuredLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level}] ${message}`;
      
      // Use cy.task to write log from Node.js side and return the chainable so callers can compose
      return cy.task('writeLog', logMessage, { log: false });
    }
    return cy.wrap(null, { log: false });
  });
}
