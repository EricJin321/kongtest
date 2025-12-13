import "cypress-real-events/support";
import { verifyFieldTooltip, FieldType, expandCollapseSection } from '../../utils/uiHelpers.js';

describe('Service Creation Interaction', () => {
  it('should verify tooltips and expand advanced fields in default URL mode', () => {
    cy.log('Step 1: Visit service creation page');
    cy.visit('http://localhost:8002/default/services/create');

    cy.log('Step 2: Verify FullUrl tooltip');
    verifyFieldTooltip(
      'gateway-service-url-input',
      'This is the URL of the API you will manage in Kong Gateway.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 3: Verify Name tooltip');
    verifyFieldTooltip(
      'gateway-service-name-input',
      'The Service name.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 4: Verify Retries field does not exist before expanding');
    cy.get('[data-testid="gateway-service-retries-input"]')
      .should('not.exist');

    cy.log('Step 5: Expand advanced fields section');
    expandCollapseSection('[data-testid="collapse-trigger-content"]', 'View advanced fields');
    
    cy.log('Step 6: Verify advanced fields section is visible');
    cy.get('[data-testid="collapse-hidden-content"]')
      .should('be.visible');

    cy.log('Step 7: Verify Retries tooltip');
    verifyFieldTooltip(
      'gateway-service-retries-input',
      'The number of retries to execute upon failure to proxy.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 8: Verify Connection timeout tooltip');
    verifyFieldTooltip(
      'gateway-service-connTimeout-input',
      'The timeout in milliseconds for establishing a connection to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 9: Verify Write timeout tooltip');
    verifyFieldTooltip(
      'gateway-service-writeTimeout-input',
      'The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 10: Verify Read timeout tooltip');
    verifyFieldTooltip(
      'gateway-service-readTimeout-input',
      'The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 11: Verify Client certificate tooltip');
    verifyFieldTooltip(
      'gateway-service-clientCert-input',
      'Certificate to be used as client certificate while TLS handshaking to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 12: Verify CA certificates tooltip');
    verifyFieldTooltip(
      'gateway-service-ca-certs-input',
      'Array of CA Certificate object UUIDs that are used to build the trust store while verifying upstream server\'s TLS certificate. If set to null when Nginx default is respected. If default CA list in Nginx are not specified and TLS verification is enabled, then handshake with upstream server will always fail (because no CA are trusted).',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 13: Verify TLS verify checkbox tooltip');
    verifyFieldTooltip(
      'gateway-service-tls-verify-checkbox',
      'Whether to enable verification of upstream server TLS certificate. If set to null, then the Nginx default is respected.',
      { fieldType: FieldType.CHECKBOX }
    );

    cy.log('Step 14: Verify Tags field is not visible before expanding');
    cy.get('[data-testid="gateway-service-tags-input"]')
      .should('not.be.visible');

    cy.log('Step 15: Expand tags section');
    expandCollapseSection('[data-testid="tags-collapse"] [data-testid="collapse-trigger-content"]', 'Add tags');

    cy.log('Step 16: Verify Tags tooltip');
    verifyFieldTooltip(
      'gateway-service-tags-input',
      'An optional set of strings associated with the Service for grouping and filtering.',
      { fieldType: FieldType.INPUT }
    );
  });
});

describe('Service Creation Manual Configuration', () => {
  it('should verify tooltips in manual configuration mode', () => {
    cy.log('Step 1: Visit service creation page');
    cy.visit('http://localhost:8002/default/services/create');
    
    cy.log('Step 2: Click manual configuration radio');
    cy.get('[data-testid="gateway-service-protocol-radio-label"]')
      .scrollIntoView()
      .should('be.visible')
      .click();

    // Wait for the form to update after switching modes
    cy.get('[data-testid="gateway-service-protocol-select"]')
      .should('be.visible');

    cy.log('Step 3: Verify Protocol tooltip');
    verifyFieldTooltip(
      'gateway-service-protocol-select',
      'The protocol used to communicate with the upstream.',
      { fieldType: FieldType.SELECT }
    );

    cy.log('Step 4: Verify Host tooltip');
    verifyFieldTooltip(
      'gateway-service-host-input',
      'The host of the upstream server. Note that the host value is case sensitive.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 5: Verify Path tooltip');
    verifyFieldTooltip(
      'gateway-service-path-input',
      'The path to be used in request to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 6: Verify Port tooltip');
    verifyFieldTooltip(
      'gateway-service-port-input',
      'The upstream server port.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 7: Verify Retries field does not exist before expanding');
    cy.get('[data-testid="gateway-service-retries-input"]')
      .should('not.exist');

    cy.log('Step 8: Expand advanced fields section');
    expandCollapseSection('[data-testid="advanced-fields-collapse"] [data-testid="collapse-trigger-content"]', 'View advanced fields');

    cy.log('Step 9: Verify Retries tooltip');
    verifyFieldTooltip(
      'gateway-service-retries-input',
      'The number of retries to execute upon failure to proxy.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 10: Verify Connection timeout tooltip');
    verifyFieldTooltip(
      'gateway-service-connTimeout-input',
      'The timeout in milliseconds for establishing a connection to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 11: Verify Write timeout tooltip');
    verifyFieldTooltip(
      'gateway-service-writeTimeout-input',
      'The timeout in milliseconds between two successive write operations for transmitting a request to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 12: Verify Read timeout tooltip');
    verifyFieldTooltip(
      'gateway-service-readTimeout-input',
      'The timeout in milliseconds between two successive read operations for transmitting a request to the upstream server.',
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 13: Verify Tags field is not visible before expanding');
    cy.get('[data-testid="gateway-service-tags-input"]')
      .should('not.be.visible');

    cy.log('Step 14: Expand tags section');
    expandCollapseSection('[data-testid="tags-collapse"] [data-testid="collapse-trigger-content"]', 'Add tags');

    cy.log('Step 15: Verify Tags tooltip');
    verifyFieldTooltip(
      'gateway-service-tags-input',
      'An optional set of strings associated with the Service for grouping and filtering.',
      { fieldType: FieldType.INPUT }
    );
  });
})
