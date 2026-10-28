# Sources checked 16 October 2026

## Companion development

- Casio Moflin: https://www.casio.com/us/moflin/
- Casio app/AI guide, speaker recognition and development timeline:
  https://www.casio.com/uk/casio-blog/blog-post/moflin-app-ai-guide/
- Casio: personality continues changing after day 50:
  https://www.casio.com/us/support/moflin/faq/article/00/00/01/29/

Frank's staged expression and local text memory are our own implementation.
Casio does not publish the complete emotional-model algorithm in these sources.
Moflin's speaker recognition does not mean it understands conversations.

## Curated facts

The short factual statements are paraphrased; Frank's comments are original jokes.

- Venus rotation takes 243 Earth days; its orbit takes about 225:
  https://science.nasa.gov/venus/venus-facts/
  This refers to one rotation relative to the stars, not its solar day.
- Octopuses have three hearts; two pump blood to their gills:
  https://www.noaa.gov/stories/love-is-in-air-and-sea-5-facts-about-affections-of-marine-creatures
- Butterflies taste with their feet:
  https://nationalzoo.si.edu/animals/news/8-reasons-bee-awe-pollinators
- NASA's estimate for a teaspoon of neutron-star matter on Earth:
  https://www.nasa.gov/universe/new-nasa-mission-to-study-mysterious-neutron-stars-aid-in-deep-space-navigation/

These sources are linked beside the relevant fact in chat. The app does not
fetch or update them automatically.

## Extra v6 facts

- https://home.cern/science/computing/the-birth-of-the-web/
- https://home.cern/science/computing/the-birth-of-the-web/short-history-web/
- https://www.americanhistory.si.edu/collections/object/nmah_334663
- https://www.justice.gov/usao-mt/pr/canadian-truck-driver-admits-drug-trafficking-crime-after-us-customs-and-border

The character's punchlines are original commentary, separate from the sourced facts.


## Product reflection resources reviewed 17 October 2026

- NHS: Depression in adults — treatment. https://www.nhs.uk/mental-health/conditions/depression-in-adults/treatment/
- NHS England South West: What people can do to beat the winter blues (15 January 2026). https://www.england.nhs.uk/south/2026/01/15/what-people-can-do-to-beat-the-winter-blues/
- NHS Every Mind Matters: Smoking, drinking, drugs and gambling. https://www.nhs.uk/every-mind-matters/lifes-challenges/smoking-drinking-drugs-and-gambling/
- NIAAA: How to apply the Core Resource on Alcohol in clinical practice. https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/how-apply-core-resource-alcohol-clinical-practice

These support cautious product framing: gratitude may support mood; it is not a cure for depression, and pet feeding is not advice to self-medicate. No screening quiz or diagnostic scoring is implemented. Any future screening feature needs validated tools and an appropriate clinical-content review.


## October dialogue/facts and optional connection

Fact cards in facts.js link individually to the Computer History Museum timeline pages for 1948, 1951, 1952, 1956, 1957, 1960, 1963, 1968, 1969, 1971, 1972, 1973, 1975, 1976, 1977, 1981, 1982, 1983, 1984, 1985 and 1993. They use short original summaries, with Frank’s original jokes clearly distinguishable from factual statements. Source details that appeared inconsistent were omitted; Myst’s creators were cross-checked against MoMA/Cyan rather than retaining a timeline typo.

- https://www.computerhistory.org/timeline/
- https://www.moma.org/collection/works/164918
- https://cyan.com/company/about-cyan/
- https://www.rfc-editor.org/rfc/rfc2324.txt (April Fool coffee protocol, explicitly labelled as such)
- https://www.rfc-editor.org/rfc/rfc3514.txt (April Fool evil-bit proposal, explicitly labelled as such)
- https://science.nasa.gov/mercury/facts/
- https://science.nasa.gov/uranus/facts/
- https://science.nasa.gov/mars/facts/
- https://www.justice.gov/usao-wdtx/pr/odessan-sentenced-prison-smuggling-cocaine-inside-wheels-cheese
- https://www.cbp.gov/newsroom/local-media-release/smugglers-melon-choly-after-cbp-officers-intercept-over-15-million
- https://www.justice.gov/usao-edpa/pr/msc-gayane-crew-member-pleads-guilty-cocaine-trafficking-stemming-one-largest-drug

Technical references checked for this implementation:

- https://developers.openai.com/api/reference/overview
- https://developers.openai.com/api/docs/guides/text
- https://platform.claude.com/docs/en/api/messages/create
- https://docs.api.nvidia.com/nim/reference/llm-apis
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event

Fact sources are linked for attribution and checking, not bundled as copied articles. No runtime scraping or automatic fact import. Nothing here grants rights to third-party images; no third-party source images were added to the app.


Saved-data budget references:
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage (UTF-16 strings and persistence/security errors)
- https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria (browser quotas and storage behaviour)

## Personal hosted setup and voice research

- SiteGround File Manager: https://www.siteground.com/kb/manage-files-file-manager
- Protected URLs: https://www.siteground.com/kb/password-protect-url
- Groq quickstart/API compatibility and account limits: https://console.groq.com/docs/quickstart ; https://console.groq.com/docs/openai ; https://console.groq.com/docs/rate-limits
- Device memory estimate boundaries: https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
- Voice design and recording requirements: https://elevenlabs.io/docs/eleven-creative/voices/voice-design/ ; https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning/instant-voice-cloning
- Voice plan/licensing: https://elevenlabs.io/pricing
- Local speech alternative: https://github.com/hexgrad/kokoro ; https://github.com/hexgrad/kokoro/blob/main/kokoro.js/README.md

VOICE_RESEARCH.md distinguishes these researched options from the device voice actually shipped. No third-party speech model or audio sample is bundled.
