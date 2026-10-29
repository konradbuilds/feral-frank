# v1.5.7 — repeat connection saves

Quick setup reuses the selected provider’s stored key when the input is blank or only masking characters. A provider with no saved key still requires one. Provider selection no longer starts a competing verification before saving. Advanced settings do not overwrite keys with mask-only text. Clear status wording for reconnects.

Chromium browser integration checked initial key, repeated blank saves, masked input, reload, advanced save, limits-only save, simulated provider failure/recovery and explicit key removal. No JavaScript errors. Provider responses mocked; no live provider credentials used.
