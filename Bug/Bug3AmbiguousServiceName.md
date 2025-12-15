Priority: 4
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list page (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in the service address in the "Full URL" input box, such as `http://mockserver:1080`.
    4. Fill in "-" in the "Name" input box.
    5. Click the "Save" button to create the service.
    6. Return to the service list page and view the newly created service.
Expected:
    Services named "-" should be distinguished from unnamed services. We should consider block this request if '-' is used for some default scenario.
Actual:
    Services named "-" display the same as unnamed services, making them difficult to distinguish.
Screenshot:
    (none)
Description:
    It is possible to set the Service name to "-", which displays exactly the same as unnamed services, making them indistinguishable.