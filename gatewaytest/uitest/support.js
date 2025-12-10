// Temporary debug helper: capture uncaught application exceptions so we can
// collect stack traces during diagnosis. Do NOT leave this enabled permanently
// as it will suppress real test failures.
Cypress.on('uncaught:exception', (err, runnable) => {
	// Print the stack to the terminal/runner so you can paste it here for analysis.
	// eslint-disable-next-line no-console
	console.error('Cypress captured uncaught exception (debug):', err && (err.stack || err.message) ? (err.stack || err.message) : err);

	// Optionally send the stack to the Node side via cy.task for durable logging.
	// If you want file logging, uncomment the next lines and implement a matching cy.task('writeDebug')
	// cy.task('writeDebug', { time: Date.now(), stack: err.stack || err.message || String(err) }).catch(() => {});

	// Return false to prevent Cypress from failing the test immediately. This lets the spec continue
	// so we can observe subsequent logs and behavior. Remove this handler after debugging.
	return false;
});

