# Parked voice experiments

The complete previous source, assets, recorded greeting and research are preserved in `feral-frank-voice-archive-v1.4.3.zip`. Keep it outside the current web root and repository. The current release contains chat only: no call UI, microphone, speech service, voice endpoint or audio assets.

Before restoring calls: test repeated start/stop, rejected autoplay, silent audio, denied microphone, backgrounding, disconnected providers and timer/resource cleanup. Verify actual audible playback on real devices. Historic freeze explanations are hypotheses unless independently reproduced; old QA describes the older release only.

Keep the original Frank artwork. A future renderer could expose idle, listen, think, speak and stop states, with authored expressions and mouth poses. Audio output should be opt-in; text remains available. No background microphone.

Future one-click installation: a packaged desktop launcher can bundle the local runtime, choose a data folder and create a shortcut. A normal webpage cannot silently install a localhost service. This remains a future idea.
