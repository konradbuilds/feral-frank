> Historical idea register, not a shipped-feature list. Current scope: chat, explicit character controls and editable memory. Calls and automatic growth are parked.

# Feral Frank — product vision and idea register

Captured 17 October 2026 UTC / 18 October in Berlin. This register preserves the ideas, including ones not implemented. Items can be cut deliberately later; absence from the current UI does not mean an idea was discarded.

## The core

An expressive digital companion for developers, designers, digital workers and weirdos. A place to review a hard-to-explain day, share context, vent, laugh and wind down. Over time, the aspiration is less repeated explanation and more useful continuity: what I am building, what matters, how I decide, and why.

Frank is the established cartoon raccoon, not a generic realistic raccoon. Preserve the original image, face, character and existing ink style. Realistic dumpster textures alongside cartoon Frank can create the surreal quality Konrad likes. The first generated concept used the wrong raccoon and is rejected as a character reference; the corrected concept is an exploration of the dumpster only, never a replacement master character asset.

## Interface and information architecture

| Idea | Direction / status |
| --- | --- |
| Separate homepage | Short index.html landing: introduction, audience, benefits, honest current capabilities, one-click entry. About 3 sections, rather than onboarding text inside the chat. |
| Standalone app | Built as app.html with local assets. The app uses relative URLs and can be hosted in a subdirectory. It is not a single-file distribution because artwork, worker and mobile behaviours are separate assets. |
| Latest brown redesign | Screenshot supplies mobile visual direction: large title and short intro left, feeding block lower left, cropped original Frank right, warm brown chat, taupe meters/composer, cream and lilac bubbles. Attached HTML contains structure but its stylesheet did not contain the large-header design. |
| Hidden motto | Removed from the app layout. Its settings button moves to a labelled workspace control. |
| Settings vs “what is this?” | Separate purposes: expandable short explanation; labelled Settings opens practical controls. Start help inside settings remains short and optional. |
| Setup | No required wizard or account for local use. Future connected setup should offer a simple purpose/provider decision, then optional advanced fine-tuning. |
| Progressive tips everywhere | Initial implementation: meter explanations, What is this?, local-mode disclosure, privacy/roadmap details. More contextual tips can be added when they answer a real question, not as decoration. |
| Mobile | Keep compact companion header and chat primary. Secondary notes in a drawer; settings as a sheet. Avoid showing the whole desktop simultaneously. |
| Desktop >= 1000px | Revised after steering: original mobile chat and composer in a taller phone-width centre column; header/meters at left. No chat redesign. |
| Optional right column | Shelved after steering. Right stays empty. My stuff is an optional drawer, not a permanent third column. Keep it user-centred; do not add filler stats just to occupy width. |
| Other right-column uses | Saved messages, read-later links, pinned context, task queue, current goals and user-chosen check-ins remain candidates. Notes are the first useful implementation. |
| Dumpster chat | Separate corrected visual concept: top-down metal dumpster around clean readable chat, small trash only on the rim. Keep the live UI readable and test contrast before adopting the illustrated frame. |
| Settings placement | Desktop settings sheet comes from right; labelled button remains near chat. Scope is broader than AI model settings, so do not place it exclusively under the pet or provider. |

## Frank, fun and interaction

- Original expressive Frank stays central. Feeding should feel worth showing friends: separate drink and joint performances, detailed eyes, facial timing, anticipation, gesture, overshoot and recovery; dream/reality mixing is welcome.
- Current build adds bounded toast/drift body timing to the existing layered eye/mouth acting and laser effect. It does **not** claim new frame-by-frame, anatomically rigged arm animation. A dedicated animation pass is still needed to meet the full ambition.
- Build one satisfying animation prototype per action before expanding. Acceptance: expression readable at phone size; no text/click-target displacement; one performance at a time; reduced-motion alternative; no endless effect timers.
- Thankful is the first and most important fictional meter. Only the joint interaction refills it. Frank never asks for weed because it is low or because he feels bad. Low-state tip suggests a fact, a nudge or a break without pressure.
- Drink interaction always refills ease of mind. Current third label is energy. Screenshot’s “happy thoughts” stays a candidate, not a deleted idea.
- Candidate third meanings: spark, curiosity, headspace, energy, connection, contentment, playfulness, confidence, hope, calm. Recommendation: energy for a fictional pet stat; spark if a more distinctive name survives user testing.
- Non-substance interaction remains available: nudge Frank, sourced fact, local chat, notes. Entertainment mechanics are not instructions for the user’s own consumption.
- No guilt, streak penalties, withdrawal language or purchase/consumption pressure. Returning after a break should be pleasant, not a chore.

## Reflection, mental health and substance information

- Optional gratitude area via thankful: tiny examples, appreciation routines, journalling, links, and later meditation material if useful. Never a forced lesson after a feeding click.
- Optional ease-of-mind area: park thoughts, wind-down prompts, small actions. Current implementation is reflection copy, not a clinical intervention.
- Optional alcohol and cannabis information, with a neutral self-check and context/comparisons. Preserve the idea of a quiz, but do not invent prevalence rankings, diagnose, or call it a “landscape of alcoholism”. Use validated tools, sourced interpretation, clear scope and explicit consent if built.
- A drink/joint click may offer an unobtrusive information link in future; never interrupt every performance with a modal quiz.
- Gratitude may support mood for some people. It is not a direct antidote/cure for depression. Do not frame alcohol or cannabis as depression/anxiety treatment. Sources are recorded in SOURCES.md.
- Potential user-selected reflection dimensions (not passive “detectors”): energy; mental load; calm; connection; sleep/rest; focus; stress; enjoyment; sense of progress; motivation; self-kindness; agency; gratitude; belonging; overwhelm; rumination; recovery; physical comfort; hope; loneliness; creative spark; boundaries; screen fatigue. Show at most 1–3 chosen dimensions, no inferred diagnosis or hidden score.
- Avoid automatic emotional surveillance or diagnostic classification. Let users choose whether to record check-ins, see the records and delete them independently.

## Growing character — workshop requested

Dedicated workshop topic, not resolved by one feature sprint. Questions and proposed starting points are below.

1. **Day one voice:** dry, kind, observant, scruffy; dark humour without cruelty. No invented shared history. What boundaries should jokes have? Which 5 lines feel unmistakably Frank?
2. **Local-only growth:** activity days unlock authored expression/line variety. Traits are simple bounded counters, not model learning or real emotions. Current version already has this mechanism. A local-only Frank cannot understand arbitrary conversation or become an intelligent agent through accumulated messages.
3. **Memory types:** explicit profile facts; user-approved durable preferences; project context; short daily summaries; temporary session state. Keep provenance/date/confidence, distinguish user statements from assistant guesses, handle corrections.
4. **Emotional continuity:** remember what the user chose to share; adjust tone without pretending to feel, need the user, or be their only friend. How much affectionate language feels right? Avoid dependency mechanics.
5. **Evolving personality:** user-tunable humour and warmth; small visible changes; reversible settings. Growth should reflect usefulness and shared context, not mere message volume.
6. **Consolidation:** propose a short daily summary, let the user edit/approve before promoting facts. Deduplicate and expire stale context. Keep source references and delete propagation. Never silently treat inferred motives as truth.
7. **Success measure:** fewer repeated explanations, useful recalled context, fewer wrong assumptions. Test with real repeat tasks and recall/correction cases; engagement time is not the main metric.
8. **Portable memory:** export a human-readable profile/project brief plus structured data. Decide local-only, encrypted sync or self-hosting; define who holds keys, backup/recovery and device conflict rules before implementing sync.

## Chat, work and connected-agent vision

- Chat for fun and venting, plus a distinct practical work mode. Separate mode switches were shelved in the simplicity pass; no unconfigured model is activated.
- Train journeys / on-the-go: ask Frank to research or prepare tasks, return to a clear result queue. Requires a backend worker for reliable work while the tab is suspended or closed.
- Email assistant: OAuth connection, least-privilege reads and draft creation, user demonstrates edits; learn approved writing preferences and decisions. Important messages and proposed responses in a review queue with links to source and drafts. Sample-check routine items; approval before send by default.
- Never claim “connected to Gmail” from a decorative button. Do not send mail as part of this prototype.
- Providers contemplated: OpenAI, Anthropic/Claude and NVIDIA-hosted models. Consumer ChatGPT/Claude account access must not be assumed equivalent to an API integration. Verify provider APIs, auth, terms, cost and retention at implementation time.
- Manual model selection first. Later automatic routing by task, privacy, budget, latency and capability, with a visible override and explanation. Benchmark choices rather than claim “perfect model”.
- Frank improves prompts, sends work to a model, reviews returned output, requests improvements and only hands off strong work. Bound iterations, tokens, cost and runtime. Preserve evidence; expose progress/cancellation and human review for consequential actions.
- Daily/nightly reflection: summarise useful activity, consolidate notes, shorten redundant context and learn from accepted edits. Needs an authorised scheduler/service, audit trail and user control. Nothing runs overnight in this static release.
- Workday review: what happened, what mattered, decisions/why, unfinished items, useful reminders, ideas and a practical next step. User-owned editable diary/README/help files rather than an opaque mind-reading profile.
- Desktop companion someday: optional app shell or desktop overlay, explicit context sharing and visible pause. Do not record the screen, microphone, apps or files continuously by default. Permissions, retention and exclusions need a separate design.

## Local storage, privacy and performance

- Current app chat is bounded to 200 saved messages plus introduction; explicit memory fields/notes/episodes and activity days are bounded. Scratch notes are separate: six × 600 characters. These are separate controls and separate meanings.
- Selective message deletion: chat only or matching saved memory; memory editor; export; clear chat while keeping memory; forget memory/chat. Scratch notes each have their own Delete control and are not cleared by the memory/chat button.
- Future controls: storage inspector by category, export/import with schema validation, retention windows, selective project erasure, undo/recovery where practical, and deletion propagated into future summaries/backups.
- Browser pages cannot enforce a hard per-tab RAM cap. Lean mode should instead bound history/DOM, reduce expensive art, pause hidden/offscreen motion, limit attachments, cancel work and avoid redundant context. Never label a preference a RAM cap when it cannot guarantee that.
- Memory consolidation must not become an unbounded nightly log. Measure growing data and timer/listener counts under stress.
- Browser local storage is not encrypted secure storage; clearing browser data removes it. Sharing a browser profile exposes local content. Future remote processing requires clear data flow, access controls and a real privacy policy.

## Product strategy and release sequence

**Now:** coherent local companion, honest capability disclosure, original Frank, landing/app separation, desktop workspace, notes, retained PWA controls, usable memory settings.

**Next:** workshop on personality/memory; dedicated animation study; evaluate actual user tasks; decide on a secure single-provider AI service with budget controls and explicit data sharing. Add one useful work task before multiple integrations.

**Then:** project memory with provenance/corrections; daily review; draft-only email workflow; model routing once measured; scheduled jobs; encrypted cross-device sync if justified.

**Research:** emotional companionship boundaries, optional evidence-based wellbeing material, desktop context permissions, reliable background jobs, richer animation, dumpster frame readability.

## Critical product review

The differentiated opportunity is enjoyable context continuity for digital people. “Pet + email agent + therapist + every model + desktop surveillance” is too many products for a first release. Keep three promises: pleasant company, inspectable context, one useful next step. Build trust by showing what Frank actually remembers and what he cannot do.

The local beta can be shared as a playful PWA once hosted correctly. Calling it a fully learning AI companion or an app-store-ready autonomous assistant would overstate it. The animation ambition and connected-service security deserve their own acceptance gates.

Public launch checklist: hosting HTTPS; install/offline/update on target devices; public canonical and absolute OG image URLs; privacy/legal notices appropriate to operator/jurisdiction; ownership/licensing of all assets; independent accessibility/device tests; backend auth/rate limits/spend limits before public AI. No claim of blanket WordPress, medical, legal or app-store compliance.

## Final scope correction from Konrad

Mobile is loved: preserve its appearance and interactions. Desktop is a sideways extension, not a new design: take the existing bottom/chat half, make it full-height and phone-width, centre it; move Frank’s header and bars to the left. Keep colours, bubbles, icons, original Frank and existing style. No permanent right panel, new mode tabs, new dashboard or redesign. Limit additions to private scratch notes and a small optional fact prompt. The separate introduction lives at index.html; app.html remains direct entry to the app.

Confirmed product anchor in Konrad’s words: “100 percent mate! you got it!” in response to “less repeated explaining, with a character you enjoy spending time with.”

Differentiation hypothesis: consistent expressive character + reliable editable context, with memory provenance, corrections, project scope and useful recall. More memory alone is not enough; test recall accuracy and reduced re-explanation against ordinary chat. New memory architecture is a workshop/prototype topic, not silently implemented learning.


## Reconfirmed differentiators — 18 October 2026

- A specific audience: developers, designers and people who live digitally, whose workday takes too much backstory to explain before they can review it or wind down. Familiar company and practical continuity belong together.
- Frank is the middleman for AI work: he sees the activity routed through him, prepares clearer briefs, reviews results and carries accepted decisions forward. This is not access to unrelated ChatGPT/Claude apps.
- Cost caps and early warnings belong in the core concept, with bounded retries and visible spend. A real hard cap must be enforced on the backend before authorising requests; warnings alone are not a spending guarantee. Consumer subscription allowances cannot be inferred from API traffic.
- The desktop/native aspiration is context across the whole working day: user-selected apps, projects and activity, with explicit permissions, visible recording status, exclusions and pause. Native packaging alone cannot guarantee complete or correct context. Sources and uncertainty must remain inspectable.
- None of this context capture, live AI review or cost enforcement runs in the current local demo. The landing labels it as the vision.

- Reconfirmed emotional/motion anchor: a richly animated wind-down companion for a stressful digital day. No need to wind down alone. Expressive eyes, face/body acting, personality and eventual live voice are part of the core product ambition, not decorative extras. The current layered artwork demonstrates a starting point; full cartoon-quality performance needs a dedicated rig and motion library.


## Implemented voice/connection step — 18 October 2026

Kept voice inside the existing app, with Frank always on screen. Dictation is draft-first; opt-in read-aloud follows new replies only. An explicit turn-based conversation keeps the microphone off while AI replies and speech plays. Written replies remain available. This is preferable to a separate call app for continuity, visible history and a single clear End conversation control.

The optional personal Node bridge now connects OpenAI, Claude, NVIDIA NIM or local Ollama, reuses saved keys/model choices, bounds requests and output, warns near the daily attempt cap and stops at it. This does not provide monetary credit balances, automatic model selection, prompt improvement loops or autonomous tasks. Those remain later work.

Original-art layered animation now adds listening head tilt, thinking gaze and speech duration/word-boundary mouth activity. A full cartoon performance library (turnarounds, phoneme shapes, independent arms, expression transitions, artist-authored timing) remains a dedicated next production stage; it is not replaced with a generic raccoon. Preferred future UX remains the same character in the same app, not a second disconnected experience.

Authored local dialogue has 109 lines and explicit uncertainty. A source-linked set of 100 new fact cards adds computing history, space and unusual seizures. Facts and unknown questions are handled separately. No prepared-line count is presented as genuine understanding.

Latest character direction: cheerfully accepts fictional drinks; remove the old hydration response. More excitement, surprise, wonder and confusion, while no guilt or pressure toward real substance use.


## Next character/voice workshop

See CHARACTER_ROADMAP.md for the current-vs-proposed distinction, Casio Moflin reference, stable identity + slow temperament + passing moods + history-based quirks experiment, source-backed correctable memory, and lean SVG actor/voice library options. Keep the same app and original Frank design. No autonomous memory rewriting or additional tracking was enabled in this notice update.


## Repetition/frustration reduction experiment

Priority proposal: an inspectable shared project brief containing the current goal, approved decisions, explicit corrections/rejected ideas and acceptance checks. A session handoff should preserve it across models. Before proposing a result, Frank checks it against that brief and reports what was actually tested. Corrections update source-linked records; inferred preferences need approval. No automatic prompt/review loop or magical claim to outperform the base model. Compare a few real tasks with/without the brief and count repeated corrections/time before expanding it.

For setup, every warning should link directly to the relevant option; guidance and setup live together. The local-mode guide and saved-data profiles are implemented. Account authorisation, provider key creation and installing a local model cannot be silently bypassed. A future setup wizard can reduce clicks without choosing an expensive model or sending paid test messages without clear intent.

## Guided call and voice identity — 18 October 2026

Implemented: optional tab diagnostics; a personal password-protected PHP route for SiteGround; Groq free-tier setup guidance with an external key tab and return instructions; save-and-call; two synthesized rings, an authored pickup greeting, device-voice previews and cancellation before pickup. No subscription-token reuse or unattended microphone. Current hosted connection needs the app upload and private password file first. See SETUP.md.

Next: choose Frank’s consistent voice by audition, then a small matching reaction bank plus a bounded server-side TTS adapter. Research, recording requirements, local-model tradeoffs and original voice direction are saved in VOICE_RESEARCH.md. No custom speech provider has been connected or custom audio clips shipped in this revision.

## Latest scope decision: AI-only, lean interface
Scripted conversation, sourced fact cards, idle chatter and meter explanations are removed from the shipped app. Keep those older ideas as a shelved record only. Notes and editable memory remain. Composer controls require a checked provider key/model. Settings prioritises short controls, collapsed explanations and a separate voice group. Public shared-key demos require a separate visitor/account design; not part of the personal bridge.
