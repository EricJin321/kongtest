/**
 * Write log message via Cypress task
 * @param {string} message - Message to log
 */
export function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  // Use cy.task to write log from Node.js side
  cy.task('writeLog', logMessage, { log: false });
}
