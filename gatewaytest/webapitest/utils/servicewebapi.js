import { apiRequest } from './apiHelper';
import { getBaseUrl, buildUrl } from './configLoader';

/**
 * Service layer for WebAPI endpoints
 */
class ServiceWebApi {
  /**
   * Call the hello endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static helloApi(isHttps = false, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/hello');
      cy.log(`URL being requested: ${url}, isHttps: ${isHttps}`);
      
      return apiRequest(url, isHttps).then((response) => {
        // Verify status code
        expect(response.status).to.eq(expectedStatus);

        // Verify response body if expected response is provided
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
      });
    });
  }
}

export default ServiceWebApi;
