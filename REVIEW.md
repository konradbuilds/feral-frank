# Release review — Feral Frank v1.5.0

24 October 2026. Chat-only release with the existing artwork and layout.

## Changes

- Archived the entire v1.4.3 voice experiment separately. No call, microphone, speech endpoint or audio asset is shipped in this version.
- Removed hidden personality-growth scoring and its UI. Memory remains editable, bounded context.
- Added one Frank character panel: reply length, humour, roughness, opinion and an optional style note. No modes or profiles.
- Shared core persona and validated settings across PHP and Node. Consequential decisions prioritise goals, facts, uncertainty and trade-offs. Recommendations remain conditional; user agency is explicit at every opinion level.
- User style notes and memory are bounded lower-priority context, not system-prompt interpolation. This is defence in depth, not a claim that prompt injection is solved.
- Added an authored slider example and optional AI test. Tests do not enter history or memory. Preferences save locally; reset keeps chat and memory.
- Updated setup instructions, homepage, README screenshots and public demo assets.

## Verification

- Chromium 153.0.8010.0, Firefox 157.0, WebKit 27.2: character persistence, reset, no old call/growth controls, no JS page errors, six viewport checks (320×640, 390×844, 390×500, 768×1024, 844×390, 1440×900). Rendered screenshots inspected.
- Final docs demo: responsive app and homepage; repeated settings open/close, Tab containment and Escape focus return; scripted demo interaction. Screenshots inspected, including chat bubbles and actual connected chat UI with simulated replies.
- Real Node HTTP bridge with mocked upstream: connect key/model, character test isolation, subsequent chat, validated character instructions and lower-priority style note forwarding.
- Existing Node suite: five providers, private files, CSRF, saved keys/models, invalid settings rollback, rate/daily caps, failed provider auth, usage persistence. All upstream calls mocked.
- PHP 8.3: lint, four-provider payload construction, Unicode/history limits, duplicate filtering, private writes, secret exclusion and daily rollover.
- PHP HTTP: setup gate, sign-in, CSRF/origin/session checks, key privacy and permissions, invalid settings rollback, request caps, private manifest and password rotation. No real provider requests.
- New Node/PHP character checks: defaults, invalid enum rejection, decision rules at all levels, bounds and separation of untrusted style notes.

## Limits

No real provider key or model-quality evaluation was available. An AI may ignore or misinterpret instructions. WebKit is not branded macOS Safari; Opera, old browsers, physical touch devices and screen readers were not tested. Repeated interaction checks are not an all-day soak or proof of zero leaks. Current provider pricing/model availability was not re-researched for this character-only update.

## Upgrade

Replace app files, including frank.php and the new character.php/character-spec.json. Keep real private config, keys and usage files unchanged. Remove the old call files listed in SETUP.md. Close old tabs or use Update app. Never deploy the separate voice archive into the web root.
