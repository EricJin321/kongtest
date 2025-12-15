Priority: 1
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list page (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in the service address with a path in the "Full URL" input box, such as `http://mockserver:1080/mock`.
    4. Fill in the Service Name, such as "TestServiceWithPath".
    5. Click the "Save" button to create the service.
    6. Enter the details page of the newly created service (/default/services/<serviceId>).
    7. Click the "Add Route" button to enter the route creation page.
    8. Fill in the route name in the "Name" input box, such as "TestRoute".
    9. Fill in `/` in the "Path" input box.
    10. Select HTTP Methods, such as GET.
    11. Click the "Save" button to create the route.
    12. Send a request to `http://localhost:8000/mock/hello` via curl or browser.
Expected:
    The upstream server should receive `/mock/hello` (path not duplicated).
Actual:
    The upstream server receives `/mock/mock/hello` (path duplicated).
Screenshot:
    Bug1Service.json, Bug1Route.json, Bug1KongLog.txt, MockServerLog.png
Description:
    When a Service is configured with a path (e.g., `http://mockserver:1080/mock`) and the Route path is `/`, the path is duplicated when forwarding requests to the upstream, regardless of whether `strip_path` is enabled or disabled, resulting in issues like `/mock/mock/hello`.