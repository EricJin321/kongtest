Priority: 4
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Expand "View advanced fields" and check the allowed ranges for Retries and timeout parameters.
    4. Try entering extremely large values, such as Retries: 32767, Connect timeout: 2147483646ms.
Expected:
    Should have reasonable maximum value limits and user warnings.
Actual:
    Allows entering extremely large values (such as 24.8 days), which may lead to abnormal system behavior.
Screenshot:

Description:
    The maximum values for Retries and timeout parameters are too large (32767 retries, 24.8 days timeout). More reasonable upper limits should be set.