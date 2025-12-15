Priority: 2
Repro Steps:
    1. Create a regular Service.
    2. In the service page, click on "Add a route".
    3. Fill in required fields like Name and Path, but do not select any HTTP Methods (leave the Methods section empty).
    4. Click "Save".
Expected:
    Should display a validation error prompting to select at least one HTTP method.
Actual:
    Allows saving and creating the Route, but the Route is meaningless and will not match any requests.
Screenshot:

Description:
    When creating a Route, it is possible to save without selecting any HTTP methods. The created Route cannot match any requests but no warning is given.