import { fillInput, clickWhenEnabled, clickSidebarItem } from '../../utils/uiHelpers.js';
import KongManager from '../../utils/kongManager.js';

describe('Sidebar Navigation Verification', () => {
  after(() => {
    // Clean up the service created in the test
    KongManager.deleteService('JumpTestService');
  });

  it('should navigate to Gateway Services and Routes pages', () => {
    cy.visit('http://localhost:8002/default/overview');

    // Click Gateway Services
    clickSidebarItem('Gateway Services');
    cy.url().should('eq', 'http://localhost:8002/default/services');

    // Click Routes
    clickSidebarItem('Routes');
    cy.url().should('eq', 'http://localhost:8002/default/routes');
  });

  it('should navigate to Create Service page and verify creation redirect', () => {
    cy.visit('http://localhost:8002/default/services');

    // Use the same selector logic as KongManager.createService
    const createServiceSelector = 'a[data-testid="toolbar-add-gateway-service"], a[data-testid="empty-state-action"], a.k-button.medium.primary[href="/default/services/create"]';
    cy.get(createServiceSelector, { timeout: 10000 })
      .should(($els) => {
        expect($els.filter(':visible').length).to.be.gt(0, 'Expected create service button to be visible');
      })
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.url().should('include', '/default/services/create');

    // Fill form and save
    fillInput('[data-testid="gateway-service-url-input"]', 'http://mockserver:1080', { scroll: false });
    fillInput('[data-testid="gateway-service-name-input"]', 'JumpTestService', { scroll: false });
    clickWhenEnabled('[data-testid="service-create-form-submit"]', { force: false });

    // Verify redirect to service detail (UUID pattern)
    const guidPathRegex = /\/default\/services\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    cy.url({ timeout: 30000 }).should('match', guidPathRegex);
  });

  it('should navigate to Create Route page from Routes list', () => {
    cy.visit('http://localhost:8002/default/routes');

    cy.get('a[data-testid="empty-state-action"], a[href="/default/routes/create"]').first().click({ force: true });

    cy.url().should('include', '/default/routes/create');
  });
});
