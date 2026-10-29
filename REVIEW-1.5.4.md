# v1.5.4 — feeding joins chat

Preserved drink/joint replies. Each click records the action as a user chat event and the existing reaction as an assistant message, using the normal bounded, persisted chat store. Both enter the existing recent-history payload on subsequent AI requests. This is recent conversation context, not permanent memory. No AI request is made to generate feeding replies. Removed the separate temporary feedback banner and timer.

Verified in Chromium 153: both feeding actions create four chat entries; replies survive reload; six viewport sizes without JS errors or horizontal overflow. Inspected mobile screenshot. Real-provider recall not tested. Existing 12-message context window still applies.
