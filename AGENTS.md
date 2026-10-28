# Feral Frank development standards

Treat these as the default for every future change to this project.

- Preserve the approved artwork, content and visual design unless a change is requested.
- Use readable, consistently indented WordPress-style HTML, CSS and JavaScript. Keep code unminified and comments brief. No framework or dependency without a concrete need.
- Start CSS with the mobile layout. Prefer ordinary pixel/rem values and simple padding. Consolidate matching rules; remove obsolete code.
- Preserve semantic landmarks, labels, keyboard access, clear focus, modal focus containment/return, accessible names, reduced motion and contrast. Titles supplement accessible names; they never replace them.
- Keep user strings easy to translate. Do not imply English-only pattern matching supports every language. Give user content automatic text direction.
- Bound saved data and chat DOM. Use one animation loop, cancel replaced timers, pause motion in hidden tabs and respect reduced motion. Never expose provider API secrets in client code.
- Keep Konrad Sroka, https://github.com/konradbuilds, year and GPL-3.0-only credit. Ship LICENSE.txt and editable source.
- Preserve device-local privacy and explicit memory controls. No analytics or surprise background requests.
- Review HTML semantics, CSS duplication, JS state/lifecycles, storage failures, injection, API failures, metadata and asset paths before handoff.
- Test changed behaviour and representative viewports in available browser engines. Inspect rendered output where possible. Distinguish source/DOM checks from browser and assistive-technology tests.
- Never claim all browsers, all standards, legal compliance or zero bugs without evidence. State material coverage gaps and publishing prerequisites.
- Keep a short original Frank source comment. No giant ASCII banner or novelty dependency.

## Completion gate

- Establish the executable browser/version matrix before claiming visual coverage. Install missing test engines when possible.
- After every layout change, render the actual final source at narrow mobile, ordinary mobile, short height, tablet, landscape and desktop sizes. Inspect screenshots, then correct observed defects and rerun affected checks.
- Test keyboard focus, settings initial scroll, reduced motion, chat and overflow in each runnable engine. Browser engines are not interchangeable with branded browsers.
- If an engine cannot launch, record its exact attempted version and concrete failure. Identify actual macOS Safari separately from Playwright WebKit. Do not call a partial matrix universal coverage.
- Keep a release-specific matrix and findings in REVIEW.md. Report final HTML bytes/lines and bundle bytes at handoff.
- Do not turn source-only checks into a claim that a design looks finished. Report access/setup blockers early and keep working on the checks that can run.

## v0.2 scope anchor

- Preserve the approved mobile screen. At 1000px and above, move its existing chat into a taller phone-width centre column and its companion header/bars to the left. Do not redesign the chat, fill the right side or add mode tabs without a new request.
- Use the original frank.png master. Realistic textures may surround it; never replace Frank with a different raccoon.
- Product anchor: less repeated explaining, with a character you enjoy spending time with. Functional memory must be inspectable and correctable, never described as model training.
- Keep the full idea register in PRODUCT_VISION.md; shelved ideas are not silently discarded.
- Screenshot review must include a multi-message chat, not only the empty introduction: verify left/right alignment and the 10px bubble gap.

- Canonical brand: Feral Frank. Verify spelling in rendered copy, dialogue, metadata, install labels, docs and share assets. Do not invent a story defending a typo.
