Priority: 1
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in a valid address in the "Full URL" input box, such as `http://mockserver:1080`.
    4. Expand "View advanced fields", fill in a non-existent UUID in the "Client Certificate" input box, such as `a3f4c2e1-8b6d-4d9a-9f5a-1e7c2d8a4b91`.
    5. Fill in required fields like Service Name and click "Save".
Expected:
    Should display a friendly validation error message indicating the certificate does not exist or is invalid.
Actual:
    System exposes database foreign key error: the foreign key '{id="a3f4c2e1-8b6d-4d9a-9f5a-1e7c2d8a4b91"}' does not reference an existing 'certificates' entity.
Screenshot:
    DatabaseSchemaExposed.png
Description:
    When creating a Service with an invalid Client Certificate UUID, the system exposes database foreign key errors instead of friendly prompts, posing a security risk.