Priority: 2
Repro Steps:
    1. Create a regular Service.
    2. In the service page, click on "Add a route".
    3. Fill in a valid name in the "Name" input box, such as "testRoute".
    4. Fill in a path containing illegal characters in the "Path" input box, such as `/test[]`.
    5. Select at least one HTTP Method, such as GET.
    6. Click the "Save" button.
Expected:
    Route paths should be strictly validated according to RFC 3986, and illegal characters like [] should be rejected.
Actual:
    Route path validation does not strictly follow RFC 3986, allowing illegal characters like [].
Screenshot:
    (none)
Description:
    Route path validation does not strictly adhere to RFC 3986, allowing illegal characters like [].
