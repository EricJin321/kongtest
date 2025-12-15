Priority: 3
Repro Steps:
    1. Create a regular Service.
    2. In the service page, click on "Add a route".
    3. Fill in a name containing disallowed characters in the "Name" input box, such as `《test》` (《》 character is not in the allowed .-_~).
    4. Fill in other required fields (Path, etc.) and click "Save".
Expected:
    Should display a validation error indicating only letters and .-_~ characters are allowed.
Actual:
    Allows saving and actually accepts more special characters.
Screenshot:
    SpecialCharaterName.png
Description:
    The Route Name field claims to only accept letters and 4 special characters (.-_~), but actually accepts other special characters.