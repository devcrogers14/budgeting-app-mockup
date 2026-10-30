# Budgetron 3000 design document

Final version 2.0, October 26, 2026. Exported from the team's live design document.

| File | What it is |
| --- | --- |
| Budgetron 3000 Project Design Document.pdf | Main document: version history, overview, final deliverable, workflow diagram, C4 diagrams (context, container, component, code), mockup screens, app demo and break-test results |
| Budgetron 3000 Supporting Analysis.pdf | Requirements and MVP status, brainstorming, business case, competitor research, functional design, the Ask Budgetron AI feature and its guardrails, screen design and the test plan |
| c4/ | The final C4 diagrams as PNG images |

## Test results in the document

All tests were run on October 26, 2026 against the `main` branch:

- **Automated checks:** `node --test` passes 16 of 16.
- **Demo test cases:** 24 of 24 pass (one or more per feature).
- **Break tests:** 53 of 56 pass. Failures, recorded and not fixed:
  - **B21:** a monthly transfer on the 31st moves to Feb 28, then stays on the 28th.
  - **B29:** with two tabs open, saving in the older tab erases a purchase added in the other.
  - **B37:** there is no way to delete a demo account.

Live Gemini answers were not tested because no API key was used.
