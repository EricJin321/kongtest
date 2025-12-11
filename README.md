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

Example:
```bash
# Run all tests against a staging environment with a 10s timeout
cross-env ENVIRONMENT=staging TIMEOUT=10000 npm run test:all
```

## 🤖 CI/CD

This project uses GitHub Actions for Continuous Integration.
- **Linux Comprehensive CI**: Runs the full test suite (`test:all`) on every push/dispatch.
- Artifacts (logs, screenshots, videos) are uploaded upon failure or completion.

## 📝 Test Coverage

### UI Tests (`uitest/`)
- Happy Path are validated in API Tests. This covers corner case of UI Operation and Page jump verification

### API Tests (`webapitest/`)
- Validate the Service and Route creation. Run different HTTP/HTTPS combination on created Service and Route to validate its functionality. 
## Coverage:
    Service on HTTP endpoint with GET, POST, PUT, DELETE
    Service on HTTPS endpoint with GET, POST, PUT, DELETE
    Route on limited Method
    Route with NoStripPath
    Route with RegexMatch
    Route with HTTPS only
## ToDo:
    Route with Header and Host limit
    Service and ROUTE with GRPC/TCP/TLS/UDP/WS/WSS
    Route with PATCH/OPTIONS/HEAD/CONNECTION/TRACE
    Route with Priority (Multiple Match)
    Route with v1 Path handling
## NeedPlan
    Security: Auth is not covered yet. Need plan.
    Security: Need verify it actually sends https.
    Security: Client Cert and CA Cert configuration
    Performance: Notice a delay on first request. Need Identify expected Response time
    Performance: Need Test timeout handling
    Performance: Need Test Stress and verify request/response buff
    Compatible: Need setup test on different OS and browser. 
    Accessibility: Did a quick verify of tab circle and UI with multiple language. Need to make a full test plan. 

# Potential Bug
    Listed in Bug.md