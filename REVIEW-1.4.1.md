# Feral Frank 1.4.1 — 22 October 2026

Based exclusively on Konrad's uploaded frank-v1.4-tts.zip. Original artwork and five recorded greeting files preserved.

## Changes

- Initialize FrankConnection before exposing speech functions; prevent startup exceptions and preserve methods when constructing the public API.
- Include selected provider and hosted CSRF token in speech requests. Groq speech requests use WAV; OpenAI uses MP3. This does not establish a completed live voice-call experience: the inherited device-speech call path remains disabled.
- Always retrieve available models during guided key setup, retaining an existing model only if still offered. Never choose an audio-only model as a chat fallback.
- Separate key-save failures from verification failures. Preserve provider HTTP status in safe, actionable diagnostics without returning raw upstream responses or credentials. Add an explicit outbound User-Agent.
- Remove settings opening opacity fade (the earlier transparent appearance was an animation-frame observation, not a permanently transparent background).
- Restore the missing cheers animation flag. The effect is the existing whole-character toast, not a newly rigged arm lift.
- Add static public-demo notice, read-only key fields and install prompt. No backend is copied into docs/.
- Add README, GitHub publishing guide and local/hosted install distinction. Preserve GPL v3 and portfolio author links.

## Validation

- Chromium 153.0.8010.0, Firefox 157.0, Playwright WebKit 27.2: startup without JavaScript errors; settings open/close, demo installation prompt, disabled chat and captures at 320×640, 390×844, 768×1024, 844×390 and 1440×900. Representative captures visually inspected. WebKit is not branded Safari.
- Chromium: recorded demo runs through cheers animation to replay state. Physical speaker output and microphone quality were not assessed.
- Guided connection regression: simulated successful provider response, stored retired model replacement, CSRF, rejection/HTTP 401 diagnostic and disconnected state. No real Groq key was available.
- Actual PHP 8.3 HTTP checks: password gate, private-file permissions, CSRF/origin enforcement, safe settings writes, rollback, request limits, private manifest and password rotation.
- PHP syntax/helper/status-diagnostic tests, JavaScript parsing (including inline scripts), storage bounds/failure tests passed.
- Public files checked for common credential patterns; private configuration template still contains only its placeholder. docs/ is an explicit asset allowlist.

## Outstanding external check

The exact cause of Konrad's Groq rejection is not proven: the old error discarded the upstream status. Retry from the updated private install. If still rejected, the new message distinguishes 401, 403, 429 and other statuses. Do not claim a verified live Groq connection from these tests. No deployment or GitHub repository was created.

## Sources checked

- https://console.groq.com/docs/api-reference
- https://console.groq.com/docs/text-to-speech
- https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
