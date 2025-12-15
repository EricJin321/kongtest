Priority: 3
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click any Service to enter the details page, then click the "Routes" tab.
    3. Click the "Add Route" button to enter the route creation page.
    4. Enter an invalid name in the "Name" input box (such as containing special characters).
    5. Observe when the name validation error prompt appears.
Expected:
    We expect it to align to service behavior and validate name on type.
Actual:
    Route name validation only prompts on Save, Service name validation prompts immediately.
Screenshot:
    (none)
Description:
    Route name validation only triggers on Save, Service name validation triggers immediately, creating inconsistent experience.
