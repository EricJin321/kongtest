/**
 * @fileoverview Service API testing utilities
 * @description Wrapper functions for testing Kong Gateway API endpoints through Cypress.
 * Provides methods for common HTTP operations with configurable protocols and assertions.
 */

import { apiRequest } from './apiHelper.js';
import { getBaseUrl, buildUrl } from './configLoader.js';

/**
 * Service layer for WebAPI endpoints
 */
class ServiceWebApi {
  /**
  * GET /testbasic/hello - Basic hello endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getHelloApi(routePath, isHttps = false, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/hello`);
      
      return apiRequest(url, isHttps).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
      });
    });
  }

  /**
  * GET /testbasic/resource - Get resource with caching support
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} ifModifiedSince - Optional If-Modified-Since header
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getResourceApi(routePath, isHttps = false, ifModifiedSince = null, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/resource`);
      const options = {};
      
      if (ifModifiedSince) {
        options.headers = { 'If-Modified-Since': ifModifiedSince };
      }
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * GET /testbasic/redirect - Test redirect behavior
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {boolean} followRedirect - Whether to follow redirects (default: true)
   * @param {number} expectedStatus - Expected HTTP status code
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getRedirectApi(routePath, isHttps = false, followRedirect = true, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/redirect`);
      const options = { followRedirect };
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * GET /testbasic/private - Protected endpoint requiring authorization
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} token - Authorization token
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getPrivateApi(routePath, isHttps = false, token = null, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/private`);
      const options = {};
      
      if (token) {
        options.headers = { 'Authorization': `Bearer ${token}` };
      }
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * GET /testbasic/forbidden - Forbidden resource endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 403)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getForbiddenApi(routePath, isHttps = false, expectedStatus = 403, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/forbidden`);
      return apiRequest(url, isHttps).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * GET /testbasic/status/500 - Internal server error endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 500)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getServerErrorApi(routePath, isHttps = false, expectedStatus = 500, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/status/500`);
      return apiRequest(url, isHttps).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * POST /testbasic/items - Create new item
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {object} body - Request body (default: empty object)
   * @param {number} expectedStatus - Expected HTTP status code (default: 201)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static postItemApi(routePath, isHttps = false, body = {}, expectedStatus = 201, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/items`);
      const options = { method: 'POST', body };
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * PUT /testbasic/items/123 - Update item
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} itemId - Item ID (default: '123')
   * @param {number} expectedStatus - Expected HTTP status code (default: 204)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static putItemApi(routePath, isHttps = false, itemId = '123', expectedStatus = 204, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/items/${itemId}`);
      const options = { method: 'PUT' };
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * DELETE /testbasic/items/123 - Delete item
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} itemId - Item ID (default: '123')
   * @param {number} expectedStatus - Expected HTTP status code (default: 204)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static deleteItemApi(routePath, isHttps = false, itemId = '123', expectedStatus = 204, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/items/${itemId}`);
      const options = { method: 'DELETE' };
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * PUT /testbasic/user/:userId - Update user by ID
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} userId - User ID to update
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static putUserApi(routePath, isHttps = false, userId, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/user/${userId}`);
      const options = { method: 'PUT' };
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * POST /testbasic/echo - Echo endpoint that returns posted data
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} data - Data to echo
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static postEchoApi(routePath, isHttps = false, data = '', expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/echo`);
      const options = { method: 'POST', body: data };
      
      return apiRequest(url, isHttps, options).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * GET /testbasic/slow - Slow response endpoint (1.5 second delay)
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getSlowApi(routePath, isHttps = false, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/slow`);
      return apiRequest(url, isHttps).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }

  /**
  * GET /testbasic/bad-request - Bad request endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 400)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getBadRequestApi(routePath, isHttps = false, expectedStatus = 400, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `${routePath}/mock/bad-request`);
      return apiRequest(url, isHttps).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
        return response;
      });
    });
  }
}

export default ServiceWebApi;
