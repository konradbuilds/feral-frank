# v1.5.5 — energy affects character

Each chat request snapshots current energy from the existing energy bar. PHP and Node append the same validated energy rule from character-spec.json. Below 30: 1–2-word casual replies; 30–70 inclusive: normal selected length, dry tone; above 70: keener, occasional exclamation marks allowed. Complete requested answers and essential safety guidance remain higher priority. No forced feeding, extra calls, retries or truncation. Existing sliders are preserved.

Tested numerical boundaries, invalid payload fallback, character validation, syntax and mocked provider bridge. No real-provider behavioural evaluation or PHP execution. No layout changes.

Replace app files including character.php and character-spec.json; keep frank-private untouched. Hard refresh; restart Node bridge if used.
