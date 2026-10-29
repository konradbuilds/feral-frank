# v1.5.6 — energy and thankfulness

Includes v1.5.3–1.5.5 changes: answer-first character, limits-only save, delete-chat shortcut and feeding history. Current energy and thankfulness are passed on every AI chat request. Both backends validate numerical values and select shared rules. Under 30 thankfulness: grumpy at the situation, not abusive toward the user. Above 70: calm, overrides low-energy irritation but preserves its brevity. Exact 30 and 70 are steady. Complete requested answers remain higher priority than banter length.

Passed threshold/invalid-input tests and all nine mood combinations, existing character tests, JavaScript syntax checks. Previous release bridge tests used mocked upstream calls. Real-model behavioural compliance and PHP runtime remain unverified. No new layout changes.

Install all public app files; leave frank-private intact. Hard refresh. Restart Node bridge if used.
