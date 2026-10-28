# v1.5.2 — 28 October 2026

Short replies and dry, casual examples from v1.5.1 are included. Frank is keen for fictional cheers without pressuring real consumption. New installs have no daily app cap: zero disables it, 1–500 enables it. Existing saved limits remain unchanged. Cap status is below the composer, hidden when disabled. Provider quotas and charges still apply.

Tests: Node provider suite; new cap test exercises 55+ attempts, enabling a cap, disabling it and persisting zero; character tests; all 81 UI slider combinations; actual notice-render function tests (off/on/reached/off). Chromium 153.0.8010.0 rendered at 320×640, 390×844, 390×500, 768×1024, 844×390 and 1440×900; screenshots inspected. Default notice hidden, enabled notice below composer, no horizontal overflow or JS errors.

PHP default, validation bounds and enforcement guard updated in parallel with Node and source-reviewed. PHP runtime, Firefox, Safari/WebKit and real provider replies were not retested in this environment. Historical v1.5.0 coverage is separate. No claim that model wording or word counts are mechanically guaranteed.

Upgrade: replace the public app folder at the same path; leave frank-private untouched. To remove an existing saved cap, set Daily attempt cap to 0 and Save & connect once.
