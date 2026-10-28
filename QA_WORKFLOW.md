# Frank release workflow

1. Freeze the requested scope and record the exact source being tested.
2. Establish the browser matrix early: Chromium, Firefox, WebKit, branded Opera,
   and real Safari on macOS/iOS when that execution environment is available.
   Include a bounded list of older versions; do not imply infinite screen/version coverage.
3. Run source/behaviour checks. Then render real pages at 320×640, 360×740,
   390×844, 520×740, 768×1024, 1440×900, 390×500 and 844×390.
4. Inspect all screenshots; check alignment, empty space, wrapping, clipping,
   icon clarity, graphic sharpness and the whole screen's hierarchy.
5. Exercise chat, memory/settings, keyboard containment/return, scrolling,
   hover/focus and reduced motion. Check console errors and horizontal overflow.
6. Fix observed defects, then rerun affected tests and inspect the new renders.
7. Package precisely the tested app. Save REVIEW.md with passed/blocked versions,
   findings, publishing requirements, HTML line count and byte sizes.

This workflow is the default for this project. A real Safari check requires an
Apple execution environment or a cloud service with Safari; Linux WebKit is
useful engine coverage but must not be relabelled Safari. Missing access is a
recorded release limitation, not a fabricated pass. Local QA screenshots stay
outside the distributable unless explicitly requested.
