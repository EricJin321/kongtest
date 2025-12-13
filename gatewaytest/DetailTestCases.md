# Test Design Document

This document outlines the test coverage provided by the automated test suite for the Kong Gateway project. The suite is divided into **API Tests** (validating Gateway proxy behavior) and **UI Tests** (validating Kong Manager functionality).

All tests listed below are executed when running the `test:all` command.

---

## 1. API Tests (`webapitest/`)

These tests verify the runtime behavior of the Kong Gateway by configuring Services and Routes via the Kong Manager UI (simulating user configuration) and then sending HTTP/HTTPS requests to the Gateway's proxy port.

### 1.1. Regex Match Test (`regexMatchTest.cy.js`)
**Objective**: Verify that Kong correctly handles regex-based routing paths.
- **Setup**: Service `RegexMatchTestService`, Route `RegexMatchRoute` with path `~/(?i)regex.*ch/`.
- **Test Cases**:
  - `should test getHelloApi with lowercase path`: Verifies matching `/regex-match`.
  - `should test getHelloApi with uppercase path`: Verifies case-insensitive matching `/Regex-Match`.
  - `should test getHelloApi with non-matching path`: Verifies 404 for `/no-match`.

### 1.2. Basic Service Test (`basicService.cy.js`)
**Objective**: Comprehensive verification of standard HTTP operations on a basic route.
- **Setup**: Service `BasicTestService`, Route `BasicRoute` with path `/testbasic`.
- **Test Cases**:
  - `should test getHelloApi`: Basic GET request (200 OK).
  - `should pass with https`: Verifies access via HTTPS.
  - `should test getResourceApi`: Verifies caching headers (`If-Modified-Since`).
  - `should test getRedirectApi`: Verifies redirect behavior (302 Found).
  - `should test getPrivateApi`: Verifies authentication simulation (401 vs 200).
  - `should test getForbiddenApi`: Verifies 403 Forbidden response.
  - `should test getServerErrorApi`: Verifies 500 Internal Server Error handling.
  - `should test postItemApi`: Verifies POST request (201 Created).
  - `should test putItemApi`: Verifies PUT request (204 No Content).
  - `should test deleteItemApi`: Verifies DELETE request (204 No Content and 404 Not Found).
  - `should test getBadRequestApi`: Verifies 400 Bad Request handling.

### 1.3. HTTPS Service Test (`httpsService.cy.js`)
**Objective**: Verify Gateway behavior when the upstream service is HTTPS.
- **Setup**: Service `BasicTestServiceHttps` (pointing to `https://mockserver`), Route `BasicRouteHttps`.
- **Test Cases**:
  - Mirrors the test cases of `basicService.cy.js` but ensures all upstream communication is secure.
  - Verifies that the Gateway can successfully proxy to an HTTPS upstream.

### 1.4. No Strip Path Test (`noStripPath.cy.js`)
**Objective**: Verify the `strip_path` configuration option.
- **Setup**: Service `NoStripService`, Route `NoStripRoute` with `strip_path=false`.
- **Test Cases**:
  - `should test getHelloApi`: Verifies that the matched path prefix is **preserved** when forwarding to upstream.
  - `should test getRedirectApi`: Verifies redirect behavior with path preservation.

### 1.5. Method Not Supported Test (`methodNotSupport.cy.js`)
**Objective**: Verify that Kong enforces HTTP method restrictions defined on a Route.
- **Setup**: Service `MethodNotSupportService`, Route `MethodNotSupportRoute` allowing only `GET`.
- **Test Cases**:
  - `should test getHelloApi with GET method`: Allowed (200 OK).
  - `should test postItemApi with POST method`: Blocked (404 Not Found / 405 Method Not Allowed).
  - `should test putItemApi with PUT method`: Blocked.
  - `should test deleteItemApi with DELETE method`: Blocked.
  - **POST-only Route**: Verifies a separate route that only allows POST (GET returns 404).

### 1.6. HTTP Block Test (`httpBlockTest.cy.js`)
**Objective**: Verify protocol restrictions (forcing HTTPS).
- **Setup**: Service `HttpBlockTestService`, Route `HttpBlockRoute` allowing only `HTTPS` protocol.
- **Test Cases**:
  - `should test getHelloApi with HTTP`: Expects `426 Upgrade Required`.
  - `should pass with https`: Expects success (200 OK).
- **Redirect Test**:
  - Verifies `httpRedirectCode` configuration (302 redirect from HTTP to HTTPS).

---

## 2. UI Tests (`uitest/`)

These tests verify the functionality and user experience of the Kong Manager interface, focusing on form validation, error handling, and navigation.

### 2.1. Service Creation Error Handling (`serviceCreationError.cy.js`)
**Objective**: Validate form constraints when creating a Service.
- **Test Cases**:
  - `should show error for invalid Full URL`: Validates URL format (e.g., rejects `file://`).
  - `should show error for invalid Name`: Validates name characters (rejects special chars like `$$`).
  - `should show error for invalid Connection Timeout`: Validates numeric constraints.
  - `should fail when creating a service with an existing name`: Verifies unique name constraint.

### 2.2. Service Creation Interaction (`serviceCreationInteration.cy.js`)
**Objective**: Verify tooltip information display for all service creation form fields.
- **Default URL Mode Tests**:
  - Verifies FullUrl and Name field tooltips.
  - Expands advanced fields section and verifies it was initially collapsed.
  - Verifies tooltips for: Retries, Connection timeout, Write timeout, Read timeout, Client certificate, CA certificates, and TLS verify checkbox.
  - Expands tags section and verifies Tags field tooltip.
- **Manual Configuration Mode Tests**:
  - Switches to manual configuration mode.
  - Verifies tooltips for: Protocol, Host, Path, and Port fields.
  - Expands advanced fields section and verifies tooltips for timeout and retry settings.
  - Expands tags section and verifies Tags field tooltip.
- **Validation**:
  - Verifies that advanced fields and tags sections are properly collapsed before expansion.
  - Ensures tooltips appear on hover and display correct information text.

### 2.3. Route Creation Error Handling (`routeCreationError.cy.js`)
**Objective**: Validate form constraints when creating a Route.
- **Test Cases**:
  - `should show error for invalid Route Name`: Validates name characters.
  - `should show error for invalid Path format`: Ensures paths start with `/`.
  - `should fail when creating a route with an existing name`: Verifies unique name constraint.

### 2.3. Sidebar Navigation Verification (`jumpVerification.cy.js`)
**Objective**: Verify navigation flows within Kong Manager.
- **Test Cases**:
  - `should navigate to Gateway Services and Routes pages`: Verifies sidebar links work.
  - `should navigate to Create Service page and verify creation redirect`: Verifies the full flow from "Create" button to "Service Detail" page.
  - `should navigate to Create Route page from Routes list`: Verifies navigation to route creation.

### 2.4. List Verification (`listVerification.cy.js`)
**Objective**: Verify that created entities correctly appear in their respective management lists.
- **Test Cases**:
  - `should display the created service in the service list`: Creates a service and asserts it is visible in the Services table.
  - `should display the created route in the route list`: Creates a route and asserts it is visible in the Routes table.
