Priority: 3
Repro Steps:
    1. Click "Gateway Services" on the left to enter the service list (/default/services).
    2. Click the "Create Service" button to enter the service creation page (/default/services/create).
    3. Fill in a URL with invalid path characters in the "Full URL" input box, such as `http://abc/path with spaces` (unencoded spaces).
    4. Observe if the input box shows immediate validation hints.
    5. Fill in other required fields and click "Save".
Expected:
    Should display validation hints during input, indicating the path contains invalid characters.
Actual:
    No immediate validation hints, errors only appear after submission.
Screenshot:
    PathWIthSpaceNoHint.png
Description:
    In Full URL mode, when the path contains invalid characters, there are no immediate validation hints, providing poor user experience.