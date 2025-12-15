Priority: 4
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list page (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in the service address in the "Full URL" input box, such as `http://mockserver:1080`.
    4. Leave the "Name" input box empty.
    5. Click the "Save" button to create the service.
    6. Return to the service list page and view the newly created service.
Expected:
    The service should display with a clear identifier, for exampel, the GUID, that need to enter to delete the service.
Actual:
    The service displays as a hyphen "-", making it difficult to distinguish from unnamed services.
Screenshot:
    (none)
Description:
    Service creation allows empty names (defaults to using GUID), but the service list displays it as "-", which creates ambiguity. We probably want to have a name filled up in database as well, to avoid other feature reading service and get a unexpected failure.