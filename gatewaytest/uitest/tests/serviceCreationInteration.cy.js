/**
 * @fileoverview Service creation interaction and tooltip tests
 * @description Tests user interactions during service creation, including field tooltips,
 * section expand/collapse, and form validation behavior.
 */

import "cypress-real-events/support";
import { verifyFieldTooltip, FieldType, expandCollapseSection } from '../../utils/uiHelpers.js';
import { SERVICE_SELECTORS, SERVICE_FIELD_TESTIDS, URL_PATHS } from '../../utils/constants.js';
import { TOOLTIP_STRINGS } from '../utils/errorCode.js';

describe('Service Creation Interaction', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
    cy.get(SERVICE_SELECTORS.URL_INPUT, { timeout: Cypress.env('pageLoadTimeout') })
      .should('be.visible');
    cy.wait(1000);
    // TODO: need get a signal that tooltip hover event binded. It happens after dom elelment shows up.
  });

  it('should verify tooltips and expand advanced fields in default URL mode', () => {
    cy.log('Step 1: Verify FullUrl tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.URL_INPUT,
      TOOLTIP_STRINGS.SERVICE_URL,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 2: Verify Name tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.NAME_INPUT,
      TOOLTIP_STRINGS.SERVICE_NAME,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 3: Verify Retries field does not exist before expanding');
    cy.get(SERVICE_SELECTORS.RETRIES_INPUT)
      .should('not.exist');

    cy.log('Step 4: Expand advanced fields section');
    expandCollapseSection(SERVICE_SELECTORS.COLLAPSE_TRIGGER_CONTENT, 'View advanced fields');
    
    cy.log('Step 5: Verify advanced fields section is visible');
    cy.get('[data-testid="collapse-hidden-content"]')
      .should('be.visible');

    cy.log('Step 6: Verify Retries tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.RETRIES_INPUT,
      TOOLTIP_STRINGS.SERVICE_RETRIES,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 7: Verify Connection timeout tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.CONN_TIMEOUT_INPUT,
      TOOLTIP_STRINGS.SERVICE_CONN_TIMEOUT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 8: Verify Write timeout tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.WRITE_TIMEOUT_INPUT,
      TOOLTIP_STRINGS.SERVICE_WRITE_TIMEOUT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 9: Verify Read timeout tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.READ_TIMEOUT_INPUT,
      TOOLTIP_STRINGS.SERVICE_READ_TIMEOUT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 10: Verify Client certificate tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.CLIENT_CERT_INPUT,
      TOOLTIP_STRINGS.SERVICE_CLIENT_CERT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 11: Verify CA certificates tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.CA_CERTS_INPUT,
      TOOLTIP_STRINGS.SERVICE_CA_CERTS,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 12: Verify TLS verify checkbox tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.TLS_VERIFY_CHECKBOX,
      TOOLTIP_STRINGS.SERVICE_TLS_VERIFY,
      { fieldType: FieldType.CHECKBOX }
    );

    cy.log('Step 13: Verify Tags field is not visible before expanding');
    cy.get(SERVICE_SELECTORS.TAGS_INPUT)
      .should('not.be.visible');

    cy.log('Step 14: Expand tags section');
    expandCollapseSection(SERVICE_SELECTORS.TAGS_COLLAPSE_TRIGGER, 'Add tags');

    cy.log('Step 15: Verify Tags tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.TAGS_INPUT,
      TOOLTIP_STRINGS.SERVICE_TAGS,
      { fieldType: FieldType.INPUT }
    );
  });
});

describe('Service Creation Manual Configuration', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('kongManagerUrl')}${URL_PATHS.SERVICES_CREATE}`);
    // Wait for page to load completely
    cy.get(SERVICE_SELECTORS.URL_INPUT, { timeout: Cypress.env('pageLoadTimeout') })
      .should('be.visible');
  });

  it('should verify tooltips in manual configuration mode', () => {
    cy.log('Step 1: Click manual configuration radio');
    cy.get(SERVICE_SELECTORS.PROTOCOL_RADIO_LABEL)
      .scrollIntoView()
      .should('be.visible')
      .click();

    // Wait for the form to update after switching modes
    cy.get(SERVICE_SELECTORS.PROTOCOL_SELECT)
      .scrollIntoView()
      .should('be.visible');
    cy.get(SERVICE_SELECTORS.HOST_INPUT)
      .scrollIntoView()
      .should('be.visible');
    cy.get(SERVICE_SELECTORS.PORT_INPUT)
      .scrollIntoView()
      .should('be.visible');
    cy.get(SERVICE_SELECTORS.PATH_INPUT)
      .scrollIntoView()
      .should('be.visible');

    // Verify URL input is no longer visible
    cy.get(SERVICE_SELECTORS.URL_INPUT)
      .should('not.exist');

    cy.log('Step 2: Verify Protocol tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.PROTOCOL_SELECT,
      TOOLTIP_STRINGS.SERVICE_PROTOCOL,
      { fieldType: FieldType.SELECT }
    );

    cy.log('Step 3: Verify Host tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.HOST_INPUT,
      TOOLTIP_STRINGS.SERVICE_HOST,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 4: Verify Path tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.PATH_INPUT,
      TOOLTIP_STRINGS.SERVICE_PATH,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 5: Verify Port tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.PORT_INPUT,
      TOOLTIP_STRINGS.SERVICE_PORT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 6: Verify Retries field does not exist before expanding');
    cy.get(SERVICE_SELECTORS.RETRIES_INPUT)
      .should('not.exist');

    cy.log('Step 7: Expand advanced fields section');
    expandCollapseSection(SERVICE_SELECTORS.ADVANCED_FIELDS_COLLAPSE_TRIGGER, 'View advanced fields');

    cy.log('Step 8: Verify Retries tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.RETRIES_INPUT,
      TOOLTIP_STRINGS.SERVICE_RETRIES,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 9: Verify Connection timeout tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.CONN_TIMEOUT_INPUT,
      TOOLTIP_STRINGS.SERVICE_CONN_TIMEOUT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 11: Verify Write timeout tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.WRITE_TIMEOUT_INPUT,
      TOOLTIP_STRINGS.SERVICE_WRITE_TIMEOUT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 11: Verify Read timeout tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.READ_TIMEOUT_INPUT,
      TOOLTIP_STRINGS.SERVICE_READ_TIMEOUT,
      { fieldType: FieldType.INPUT }
    );

    cy.log('Step 12: Verify Tags field is not visible before expanding');
    cy.get(SERVICE_SELECTORS.TAGS_INPUT)
      .should('not.be.visible');

    cy.log('Step 13: Expand tags section');
    expandCollapseSection(SERVICE_SELECTORS.TAGS_COLLAPSE_TRIGGER, 'Add tags');

    cy.log('Step 14: Verify Tags tooltip');
    verifyFieldTooltip(
      SERVICE_FIELD_TESTIDS.TAGS_INPUT,
      TOOLTIP_STRINGS.SERVICE_TAGS,
      { fieldType: FieldType.INPUT }
    );
  });
});
