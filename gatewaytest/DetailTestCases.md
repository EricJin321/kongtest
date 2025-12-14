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
**Objective**: Validate form constraints and error messages when creating a Service.
- **Describe: Service Creation Error Handling**:
  - `should validate URL format - accept valid URLs and reject invalid ones`: Tests client-side URL validation including protocol validation (accepts http/https/grpc/ws/wss, rejects file/ftp/data), port validation (rejects negative/non-numeric/out-of-range ports), and hostname validation (rejects spaces, invalid characters, malformed IPs).
  - `should show errors for invalid Host and Port in manual configuration mode`: Validates that empty Host and out-of-range Port (65536) trigger error messages in manual mode.
  - `should show error for invalid Name (MyService$$)`: Validates name character constraints (rejects `$$`).
- **Describe: Service Creation with Schema Violation URLs**:
  - `should show error for invalid Retries (32768)`: Validates Retries upper bound (max: 32767).
  - `should show error for invalid Connection Timeout (0)`: Validates Connection Timeout lower bound (min: 1).
  - `should show error for invalid Write Timeout (2147483647)`: Validates Write Timeout upper bound (max: 2147483646).
  - `should show error for invalid Read Timeout (0)`: Validates Read Timeout lower bound (min: 1).
  - `should show error for invalid Connection Timeout (2147483647)`: Validates Connection Timeout upper bound (max: 2147483646).
  - `should show error for invalid Write Timeout (2147483647)`: Validates Write Timeout upper bound (duplicate test with different scenario).
  - `should show error for invalid Read Timeout (2147483647)`: Validates Read Timeout upper bound (max: 2147483646).
  - `should reject URL with incomplete IP address and show schema violation error`: Tests backend validation for incomplete IP (e.g., `http://1.1.1`).
  - `should reject URL with unencoded spaces in path and show schema violation error`: Tests backend validation for RFC 3986 violation (e.g., `/path with spaces`).
  - `should reject URL with invalid characters in query and show schema violation error`: Tests backend validation for invalid query characters (e.g., `?query=<script>`).
  - `should reject URL with unencoded quote in path and show schema violation error`: Tests backend validation for unencoded quotes (e.g., `/path"quote`).
  - `should show error for Client certificate with HTTP protocol`: Validates conditional validation - client certificate must be null for HTTP protocol.
  - `should show error for CA certificates with HTTP protocol`: Validates conditional validation - CA certificates must be null for HTTP protocol.
  - `should show error for invalid Client certificate UUID format`: Validates UUID format for client certificate.
  - `should show error for invalid CA certificates UUID format`: Validates UUID format for CA certificates.
- **Describe: Duplicate Service Name Test**:
  - `should fail when creating a service with an existing name`: Verifies unique name constraint enforcement.

### 2.2. Service Creation Interaction (`serviceCreationInteration.cy.js`)
**Objective**: Verify tooltip information display for all service creation form fields.
- **Default URL Mode Tests**:
  - Verifies FullUrl and Name field tooltips.
  - Expands advanced fields section and verifies it was initially collapsed.
  - Verifies tooltips for: Retries, Connection timeout, Write timeout, Read timeout, Client certificate, CA certificates, and TLS verify checkbox.
  - Expands tags section and verifies Tags field tooltip.
- **Manual Configuration Mode Tests**:
  - Switches to manual configuration mode (protocol, host, port, path).
  - Verifies tooltips for: Protocol, Host, Path, and Port fields.
  - Expands advanced fields section and verifies tooltips for timeout and retry settings.
  - Expands tags section and verifies Tags field tooltip.
- **Validation**:
  - Verifies that advanced fields and tags sections are properly collapsed before expansion.
  - Ensures tooltips appear on hover and display correct information text.

### 2.3. Service Boundary Values (`serviceBoundaryValues.cy.js`)
**Objective**: Test service creation with extreme timeout values and special characters in service names.
- **Test Cases**:
  - `should create service with minimum timeout values (1ms)`: Creates service `Boundary_Service-1` with Retries=0 (minimum), and all timeout fields (Connection/Write/Read) set to 1ms (minimum valid value). Verifies successful creation and redirect to service detail page.
  - `should create service with maximum timeout values (2147483646ms)`: Creates service `Boundary_Service~1` with Retries=32767 (maximum) and all timeout fields set to 2147483646ms (maximum valid value, near INT32_MAX). Verifies successful creation and redirect to service detail page.
- **Validation**:
  - Confirms service names can include special characters (`.`, `-`, `~`) per Kong's naming rules.
  - Verifies that extreme boundary values are accepted and services are successfully created.
  - Ensures proper redirect to service detail page after successful creation.

### 2.4. Route Creation Error Handling (`routeCreationError.cy.js`)
**Objective**: Validate form constraints when creating a Route.
- **Test Cases**:
  - `should show error for invalid Route Name (MyRoute$$)`: Validates that route names must only contain alphanumerics or `.`, `-`, `_`, `~`.
  - `should show error for invalid Path format (missing leading slash)`: Ensures paths start with `/` or `~/` for regex paths.
  - `should show error for invalid Host (incomplete IP 1.1.1)`: Validates that incomplete IPv4 addresses are rejected with schema violation error.
  - `should show error for invalid Host (# character)`: Validates that hostnames with special characters like `#` are rejected.
  - `should show error for invalid Host (Chinese characters)`: Validates that hostnames with international characters (e.g., `主机.com`) are rejected.
  - `should fail when creating a route with an existing name`: Verifies unique name constraint enforcement.
- **Note**: Route Boundary Value tests (e.g., extreme priority values, maximum header counts, empty methods) are not included because Route creation parameters lack client-side validation in Kong Manager UI. The form accepts invalid inputs without any validation feedback. This design limitation (documented as Bugs #11, #12, #13 in Bug.md) makes comprehensive boundary value testing impractical and of limited value for UI validation.

### 2.5. Sidebar Navigation Verification (`jumpVerification.cy.js`)
**Objective**: Verify navigation flows and page redirects within Kong Manager.
- **Test Cases**:
  - `should navigate to Gateway Services and Routes pages`: Clicks sidebar items "Gateway Services" and "Routes", verifies URL changes to respective pages.
  - `should navigate to Create Service page and verify creation redirect`: Full workflow test - navigates to Services list, clicks "Create Service" button, fills form (URL and Name), saves, and verifies redirect to Service Detail page with GUID pattern URL.
  - `should navigate to Create Route page from Routes list`: Navigates to Routes list, clicks "Create Route" action button (from empty state), verifies URL includes routes/create path.

### 2.6. List Verification (`listVerification.cy.js`)
**Objective**: Verify that created entities correctly appear in their respective management lists.
- **Test Cases**:
  - `should display the created service in the service list`: Creates a service and asserts it is visible in the Services table.
  - `should display the created route in the route list`: Creates a route and asserts it is visible in the Routes table.
