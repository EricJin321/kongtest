1. Service creation allows empty name and use a GUID to confirm deletion. However it only shows "-" as Service name in list
2. Service Name allow to use only "-", which makes the same as no name provided.
3. There is no limit on Service Name length. Cause UI issue. See BugScreenshot\LongName.png
4. Arabic doesn't align from Right. See BugScreenshot\ArabicAlign.png
5. Arabic Service Name cause selection issue in UI. See BugScreenshot\ArabicSelection.png
6. Route doesn't verify path. "/test[]" is allowed. 
7. Potential: I can use the exact Gateway endpoint to Create a Service. Does it cause a circle request?