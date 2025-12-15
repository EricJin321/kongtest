Priority: 2
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in `http://localhost:8000` in the "Full URL" input box (pointing to the gateway itself).
    4. Fill in required fields like Service Name and click "Save".
    5. Enter the Service details page and click "Add Route" to create a route.
    6. Fill in required fields like Route Name, Path, Methods, and click "Save".
    7. Access the gateway entry address corresponding to this Route via curl or browser.
Expected:
    The system should prevent or warn against such self-pointing configurations to avoid circular requests.
Actual:
    It is possible to create Services and Routes pointing to the gateway itself, which may cause circular requests.
Screenshot:
    (none)
Description:
    It is possible to create a Service pointing to the gateway itself, which may cause circular requests and needs further investigation.
