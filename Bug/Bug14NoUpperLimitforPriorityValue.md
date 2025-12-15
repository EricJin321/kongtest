Priority: 2
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click any Service to enter the details page, then click the "Routes" tab.
    3. Click the "Create Route" button to enter the route creation page (/default/routes/create).
    4. Expand "View advanced fields", fill in an extremely large value in the "Priority" input box, such as `999999999999999999`.
    5. Fill in other required fields and click "Save".
Expected:
    Should display a validation error indicating the priority value exceeds a reasonable range.
Actual:
    Shows "unexpected error" instead of friendly validation feedback.
Screenshot:
    LargePriority.png
Description:
    The Route Priority field has no upper limit. Entering extremely large values results in unexpected errors rather than proper validation.