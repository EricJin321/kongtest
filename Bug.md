# 🐛 Known Issues & Potential Bugs

1. **Path Duplication with Service Path**: When a Service is configured with a path (e.g., `http://mockserver:1080/mock`) and the Route path is `/`, a request to `http://localhost:8000/mock/hello` is forwarded to the upstream as `/mock/mock/hello`. This duplication occurs regardless of whether `strip_path` is enabled or disabled. (See `BugScreenshot\Bug1Service.json`, `BugScreenshot\Bug1Route.json`, `BugScreenshot\Bug1KongLog.txt`, `BugScreenshot\MockServerLog.png`)
2. **Empty Service Name Display**: Service creation allows an empty name (defaulting to a GUID for identification), but the Service list displays it as a hyphen `"-"`, which is ambiguous.
3. **Ambiguous Service Name**: It is possible to name a Service exactly `"-"`, making it indistinguishable from a Service with no name in the list view.
4. **Unlimited Service Name Length**: There is no character limit on Service names, leading to UI layout issues. (See `BugScreenshot\LongName.png`)
5. **RTL Alignment Issue**: Arabic text does not align correctly from right to left. (See `BugScreenshot\ArabicAlign.png`)
6. **RTL Selection Issue**: Using Arabic characters in a Service Name causes selection/highlighting issues in the UI. (See `BugScreenshot\ArabicSelection.png`)
7. **Weak Route Path Validation**: The Route path validation does not strictly adhere to RFC 3986; for example, characters like `[]` in `/test[]` are incorrectly allowed.
8. **Inconsistent Validation UX**: Route Name validation triggers only on "Save", whereas Service Name validation triggers immediately on typing (input/blur).
9. **Potential Infinite Loop**: It is possible to create a Service that points back to the Gateway's own endpoint. This needs investigation to determine if it causes a circular request loop.