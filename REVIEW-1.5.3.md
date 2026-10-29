# v1.5.3 — character and settings

- Replaced contradictory character instructions with answer-first priorities, short casual banter, complete task answers and concrete dialogue examples. Removed universal nine-word restriction and no-lists prohibition. No output truncation or automatic paid retries.
- Added limits-only Save settings: omits credentials/model, preserves verification, makes no upstream call. Memory retains its existing separate save control.
- Added Delete chat beside Settings, with confirmation, busy guard and existing memory-preserving deletion path.
- Chromium 153.0.8010.0: six sizes (320×640, 390×844, 390×500, 768×1024, 844×390, 1440×900), no JS errors or page overflow. Inspected mobile and desktop screenshots. Initial launch needed restoring SwiftShader libraries.
- Passed character validation, 81 slider combinations, five-provider mocked bridge suite, cap persistence/enforcement, limits-only payload/error cleanup, saved-key preservation and notice rendering tests.
- No live provider credentials: conversational quality and strict word-count compliance are NOT verified. PHP changes were not required; PHP runtime not exercised this release. Firefox/WebKit not rerun.

Install: replace public app files; keep frank-private untouched. Hard refresh. Restart Node bridge if used (it loads the character specification at startup). Existing user slider preferences remain; choose Short for the new short-banter policy.
