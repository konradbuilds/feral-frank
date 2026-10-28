# Frank palettes

**Rose Frank** is the default. The former palette is saved in
`midnight-frank.css`; it is not loaded by the app and adds no runtime request.
Loading that stylesheet after the app's styles restores its colour tokens.

The supplied CSS-variable screenshot takes precedence over colour sampling:

| Token | Exact value |
| --- | --- |
| --bg | #5e5c59 |
| --panel | #251c16 |
| --line | #504830 |
| --ink | #35312f |
| --dim | #787480 |
| --yellow | #dabb76 |
| --rose | #f2e3d9 |
| --panel-light | #695f53 |
| --purple-light | #d0cbd5 |

Additional solid colours sampled from the rendered screenshot: bubbles/motto/
action buttons/send background #d2c8c8; Chat + memory deletion background #fd9091. Main text is
#35312f; bubble text is #251c16. Placeholder/input text uses #d0cbd5. No green
send-button tint. The motto is weight 700. The native font stack is retained;
a screenshot cannot establish the exact installed font or OS rasterisation.

The rose colour fills the page, splash and default PWA launch background.
The sharing image was refreshed to the same warm palette.

## Contrast observation

Exact supplied colours are preserved. Muted #787480 text on #f2e3d9 is about
3.64:1 and bar labels #d0cbd5 on #695f53 about 3.92:1; these do not meet the
4.5:1 AA criterion for normal-sized text. Main/bubble text is above 7:1.
This is a documented palette limitation, not a claim of full AA conformance.

Settings now uses secondary text #5e5c59 (5.32:1 on rose), neutral taupe
#75675e accents, #fff6ef input surfaces with dark text, and neutral creator
buttons. These replace the original yellow settings accents.
