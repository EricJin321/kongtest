Priority: 3
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Select "protocol, host, port, path" mode and fill in protocol, host, port, and path respectively.
    4. Expand "View advanced fields" and check TLS-related parameters.
Expected:
    Should be able to see TLS parameters like Client certificate, CA certificates, TLS verify.
Actual:
    TLS parameters are not available, only available in Full URL mode.
Screenshot:

Description:
    When creating a Service using protocol/host/port/path mode, TLS parameters are not available. They should be available in all modes.