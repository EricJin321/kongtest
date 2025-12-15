Priority: 3
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list page (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in the service address in the "Full URL" input box, such as `http://mockserver:1080`.
    4. Fill in a very long name in the "Name" input box (hundreds of characters).
    5. Click the "Save" button to create the service.
    6. Check the display effect in the service list and open delete popup.
Expected:
    The UI should handle long names gracefully, or set character length limits.
Actual:
    Long Service names cause UI layout breakage or overflow.
Screenshot:
    LongName.png
Description:
    Service names have no character length limit, leading to UI layout issues.