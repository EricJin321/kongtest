Priority: 2
Repro Steps:
    1. Click "Gateway Entities" > "Routes" to enter the route list (/default/routes).
    2. Click the "Create Route" button to enter the route creation page (/default/routes/create).
    3. Fill in required fields like Name and Path, but do not associate with any Service (leave Service selection empty).
    4. Click "Save".
Expected:
    Should display a validation error indicating that a Service must be associated.
Actual:
    Allows saving and creating the Route, but the Route cannot properly route traffic.
Screenshot:

Description:
    It is possible to create a Route without binding it to any Service. Such a Route cannot function properly but no warning is given.