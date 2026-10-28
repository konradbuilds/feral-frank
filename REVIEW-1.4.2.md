# Release 1.4.2 review

- About is index.html; public chat is app.html; about.html redirects for old links.
- PHP serves app.html after authentication. Local Node root serves the working app; explicit index.html serves About.
- README includes two linked desktop screenshots. Owner-only GITHUB.md removed. User installation guide retained and corrected.
- Settings cog, fields, buttons, accordions and focus styling updated. Provider descriptions distinguish free-tier, mixed and paid access. Inactive voice controls hidden; recorded call preview retained.

## Verification

Chromium 153.0.8010.0, Firefox 157.0 and Playwright WebKit 27.2: settings, provider descriptions, Escape dismissal, console errors and rendered screenshots at 320×640, 390×844, 390×500, 768×1024, 844×390 and 1440×900. Desktop README screenshots captured at 1440×1000. Settings sections inspected expanded. No JavaScript errors in these runs.

Actual PHP integration checks passed: authentication, private config, session/origin/CSRF checks, settings rollback, request caps, password rotation and private manifest. Actual Node routing checks passed for app, About and demo audio MIME type. JavaScript/PHP syntax and packaged file hashes checked.

Limits: WebKit is not branded macOS Safari. No old browser/device matrix, physical microphone/audio validation or real provider key request was performed for this release. The recorded greeting is a demo, not a completed live-call system. Earlier review files document older releases.
