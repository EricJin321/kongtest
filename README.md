# Kong Gateway Test Suite

This repository contains a comprehensive automated test suite for Kong Gateway, utilizing **Cypress** for both API and E2E UI testing. It includes a local development environment setup using Docker Compose with Kong Gateway and MockServer.

## 📂 Project Structure

```
.
├── deployment/              # Docker Compose configuration for local environment
│   ├── docker-compose.yml   # Defines Kong, Postgres, and MockServer services
│   └── mock-config/         # Configuration for MockServer
├── gatewaytest/             # Cypress test project
│   ├── cypress/             # Cypress logs, screenshots, and fixtures
│   ├── uitest/              # UI Tests (Kong Manager UI)
│   ├── webapitest/          # API Tests (Test Kong Gateway Service)
│   ├── utils/               # Shared utilities (KongManager helper, etc.)
│   └── cypress.config.js    # Cypress configuration
└── .github/workflows/       # CI/CD pipelines
```

## 🚀 Prerequisites

- **Docker** & **Docker Compose**: To run the local Kong Gateway and MockServer.
  > **Note**: Docker must be configured to run **Linux containers**.
- **Node.js** (v24.11.1) & **npm** (v11.6.2): To run the Cypress tests.
- **System Dependencies (Linux/WSL only)**:
  If running on Linux or WSL, you may need to install system dependencies for Cypress:
  ```bash
  sudo apt-get update && sudo apt-get install -y \
    libgtk-3-0 libnotify-dev libnss3 libxss1 libxtst6 xauth xvfb \
    libasound2 libgbm1 libnspr4 libx11-xcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxi6 libxrandr2 libatk1.0-0 \
    libatk-bridge2.0-0 libcairo2 fonts-liberation
  ```

## 🛠️ Setup & Installation

This project includes a `Makefile` in the root directory to simplify common tasks.

1. **Start the Environment**
   Start Kong Gateway, Postgres, and MockServer:
   ```bash
   make dockerup
   ```
   Wait for the services to be ready. Kong Manager should be accessible at `http://localhost:8002`.

2. **Install Test Dependencies**
   Install Node.js dependencies:
   ```bash
   make install
   ```

## 🧪 Running Tests

You can run the main test suites using `make` commands from the root directory:

| Command | Description |
|---------|-------------|
| `make test` | Run **ALL** tests (API Comprehensive + UI Tests). |
| `make test-ui` | Run only **UI** tests. |
| `make test-api` | Run only **API** tests. |

### Advanced / Manual Execution

For more granular control (e.g., running specific subsets or opening the Cypress GUI), navigate to the `gatewaytest` directory and use `npm` scripts:

| Command | Description |
|---------|-------------|
| `npm run test:basic` | Run a basic smoke test (Service creation). |
| `npm run cypress:open` | Open Cypress Test Runner (GUI) for interactive debugging. |

### Environment Variables

You can customize the test run with environment variables:

- `TEST_SET`: Defines which spec pattern to use (`all`, `ui`, `comprehensive`, `basic`).
- `ENVIRONMENT`: Sets the target environment config (default: `local`).
- `TIMEOUT`: Overrides the default request/response timeout (default: `5000`).

## 🤖 CI/CD

This project uses GitHub Actions for Continuous Integration.
- **Linux Kong Test All**: Runs the full test suite (`test:all`) on every push/dispatch.
- Artifacts (logs, screenshots, videos) are uploaded upon failure or completion.

## 📝 Test Coverage
Detailed Automated Test Cases available in [TestDesign.md](TestDesign.md)

### UI Tests (`uitest/`)
Focuses on edge cases for UI operations and page navigation verification, as happy paths are primarily validated via API tests.
- **Service Creation Error Handling**: Validates form inputs, error messages, and constraint enforcement.
- **Service Creation Interaction**: Validates tooltip information for all service creation form fields in both URL mode and manual configuration mode.
- **Service Boundary Values**: Tests extreme timeout values (1ms and 2147483646ms) and special characters in service names.
- **Route Creation Error Handling**: Validates route name/path format, Host field validation (incomplete IP, special characters, international characters), and name uniqueness constraint.
- **Navigation**: Verifies sidebar navigation and page redirects.
- **List Verification**: Verifies that created services and routes appear correctly in their respective lists.

> **Note**: Route Boundary Value tests are not included in this suite because Route creation parameters lack client-side validation in Kong Manager UI. The form accepts invalid inputs (e.g., empty methods, no service binding, extremely large priority values) without any validation feedback. This design limitation (documented as Bugs #11, #12, #13 in [Bug.md](Bug.md)) makes comprehensive boundary value testing impractical and of limited value for UI validation.

### API Tests (`webapitest/`)
Validates Service and Route creation and functionality by executing various HTTP/HTTPS combinations against the created endpoints.

#### ✅ Current Coverage
- **Service Operations**: HTTP and HTTPS endpoints supporting GET, POST, PUT, and DELETE methods.
- **Route Configuration**:
  - Method restrictions.
  - `strip_path` behavior (NoStripPath).
  - Regex path matching.
  - HTTPS-only routes.
> **Note**: Testing for Services configured with a specific `path` is currently excluded due to unclear expected behavior regarding path forwarding (see [Bug 1](Bug.md)).

#### 🚧 To-Do
- **Route Constraints**: Header and Host matching limits.
- **Protocols**: gRPC, TCP, TLS, UDP, WebSocket (WS/WSS) support for Services and Routes.
- **Extended Methods**: PATCH, OPTIONS, HEAD, CONNECT, TRACE.
- **Routing Logic**: Route priority (handling multiple matches) and v1 path handling.

#### 📅 Planning Required
- **Security**:
  - Authentication mechanisms (currently uncovered).
  - Verification of actual HTTPS transmission.
  - Client Certificate and CA Certificate configuration.
- **Performance**:
  - Investigation of initial request latency (cold start).
  - General request latency report
  - Timeout handling validation.
  - Stress testing and request/response buffering verification.
- **Compatibility**: Cross-OS and cross-browser testing setup.
- **Accessibility**: Comprehensive audit plan (initial tab cycle and localization checks performed manually).

#### 🚫 Not In Scope
The following features and testing methodologies are explicitly excluded from the current test suite:

- **Kong Features**:
  - Consumers & Consumer Groups
  - Plugins (Rate Limiting, Auth, etc.)
  - Redis Configuration
  - Upstreams & Targets (Load Balancing)
  - Certificates, SNIs, Keys, and Vaults
- **Testing Methodology**:
  - Unit Testing (Code-level verification)
  - Whitebox Testing (Internal logic verification)
- **Service Status Verification**:
  - Kong Container runtime state monitoring
  - Direct Kong Container Log verification (outside of Cypress task logs)
  - Direct Database record verification (Postgres)

## 🐛 Potential Bugs
Known issues are documented in [Bug.md](Bug.md).