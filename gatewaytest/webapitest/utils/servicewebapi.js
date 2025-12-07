import { apiRequest } from './apiHelper';
import { getBaseUrl, buildUrl } from './configLoader';

/**
 * Service layer for WebAPI endpoints
 */
class ServiceWebApi {
  /**
   * GET /testone/hello - Basic hello endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getHelloApi(isHttps = false, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/hello');
      
      return apiRequest(url, isHttps).then((response) => {
        expect(response.status).to.eq(expectedStatus);
        if (expectedResponse !== null) {
          expect(response.body).to.deep.equal(expectedResponse);
        }
      });
    });
  }

  /**
   * GET /testone/resource - Get resource with caching support
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} ifModifiedSince - Optional If-Modified-Since header
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getResourceApi(isHttps = false, ifModifiedSince = null, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/resource');
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
   * GET /testone/redirect - Test redirect behavior
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {boolean} followRedirect - Whether to follow redirects (default: true)
   * @param {number} expectedStatus - Expected HTTP status code
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getRedirectApi(isHttps = false, followRedirect = true, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/redirect');
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
   * GET /testone/private - Protected endpoint requiring authorization
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} token - Authorization token
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getPrivateApi(isHttps = false, token = null, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/private');
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
   * GET /testone/forbidden - Forbidden resource endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 403)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getForbiddenApi(isHttps = false, expectedStatus = 403, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/forbidden');
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
   * GET /testone/status/500 - Internal server error endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 500)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getServerErrorApi(isHttps = false, expectedStatus = 500, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/status/500');
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
   * POST /testone/items - Create new item
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {object} body - Request body (default: empty object)
   * @param {number} expectedStatus - Expected HTTP status code (default: 201)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static postItemApi(isHttps = false, body = {}, expectedStatus = 201, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/items');
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
   * PUT /testone/items/123 - Update item
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} itemId - Item ID (default: '123')
   * @param {number} expectedStatus - Expected HTTP status code (default: 204)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static putItemApi(isHttps = false, itemId = '123', expectedStatus = 204, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `/testone/items/${itemId}`);
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
   * DELETE /testone/items/123 - Delete item
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} itemId - Item ID (default: '123')
   * @param {number} expectedStatus - Expected HTTP status code (default: 204)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static deleteItemApi(isHttps = false, itemId = '123', expectedStatus = 204, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `/testone/items/${itemId}`);
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
   * PUT /testone/user/:userId - Update user by ID
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} userId - User ID to update
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static putUserApi(isHttps = false, userId, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, `/testone/user/${userId}`);
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
   * POST /testone/echo - Echo endpoint that returns posted data
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {string} data - Data to echo
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static postEchoApi(isHttps = false, data = '', expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/echo');
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
   * GET /testone/slow - Slow response endpoint (1.5 second delay)
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 200)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getSlowApi(isHttps = false, expectedStatus = 200, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/slow');
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
   * GET /testone/bad-request - Bad request endpoint
   * @param {boolean} isHttps - Whether to use HTTPS (default: false)
   * @param {number} expectedStatus - Expected HTTP status code (default: 400)
   * @param {object} expectedResponse - Expected response body
   * @returns {Cypress.Chainable} Response object
   */
  static getBadRequestApi(isHttps = false, expectedStatus = 400, expectedResponse = null) {
    const protocol = isHttps ? 'https' : 'http';
    const environment = Cypress.env('ENVIRONMENT') || 'local';
    
    return getBaseUrl(environment, protocol).then((baseUrl) => {
      const url = buildUrl(baseUrl, '/testone/bad-request');
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
