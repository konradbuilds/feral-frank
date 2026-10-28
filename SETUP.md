## Updating an existing installation

Keep your existing `frank-private/config.php`, password and stored keys. Replace the app files, including `frank.php`. Open **frank.php** to use your connected installation; **app.html** is the public demo, even on your own server. In Settings → App & install, use **Update app** if offered, then close other Frank tabs and reopen frank.php.

# Install Feral Frank

## On your computer

1. Install Node.js 20+ from https://nodejs.org/ and unzip the project.
2. Open Terminal in the project folder. Run `node bridge/server.mjs`.
3. Visit http://127.0.0.1:8811. Open Settings, choose a provider, paste your key and click Save key.

Keep Terminal open; Ctrl+C stops Frank. Localhost uses HTTP safely; public hosting needs HTTPS. Opening app.html directly shows the disconnected demo. The local bridge supports fewer providers than PHP, and does not provide generated speech. Keys live outside the app in `~/.config/feral-frank`; never publish that folder.

## Pages and updates

`index.html` is About Frank. `app.html` is the static chat/demo. `frank.php` remains the private PHP app and now loads app.html internally. Installed static PWAs open app.html; the PHP PWA opens frank.php. An old about.html bookmark redirects to index.html.

To upgrade, replace the public app files, including sw.js, and close/reopen Frank tabs. Preserve your private configuration and keys outside the public directory. The public docs/ folder contains only the demo, not the backend.

---

# Talk with Feral Frank — SiteGround, no terminal

Use this route if you want Frank on your laptop and phone without running Node.js.
You need your SiteGround website, HTTPS, PHP 8.1+ with cURL and mbstring, and a provider API key.
A ChatGPT/Claude website subscription is not an API key for this connection.

## 1. Upload the app

Download and unzip the bundle. In SiteGround → Site Tools → Site → File Manager:

- Open your domain's `public_html` folder.
- Create a `frank` folder inside it.
- Upload the app files/folders there, including `app.html`, `frank.php`, JavaScript, CSS and images. Extracting the ZIP on the host is fine; keep the folder structure.
- Leave your existing website files alone.

Your app address will look like `https://YOUR-DOMAIN/frank/frank.php`.
Replace YOUR-DOMAIN with your actual domain; it is not a link to click as-is.

## 2. Add the private password file

In File Manager, go **one level above public_html**. Create `frank-private` there.
The `php-config` folder contains a template, not your live private configuration. For an existing installation, keep your private configuration unchanged.

Upload the bundle's `php-config/config.php` **into that private folder**, named `config.php`.
Edit its password value to a unique password of at least 16 characters. Avoid single quotes/backslashes in this value unless you know PHP escaping. Save.

| File | Where it goes |
| --- | --- |
| App and `frank.php` | `public_html/frank/` |
| Private `config.php` | `frank-private/config.php`, beside public_html |

Keep the real private config readable only by your hosting account/PHP process (typically permissions 600). Do not put your real private config or API key inside public_html. The shipped template contains no key.
The bridge refuses to run if this location/password is missing or unsafe. It automatically creates private key/usage files there after you save settings. If permissions prevent saving, use SiteGround's support to make this folder writable by your PHP process; do not make it publicly accessible or world-writable.

For an extra gate, Site Tools → Security → Protected URLs can password-protect `/frank` too. That is optional; Frank already requires its own password for every API route. This is a personal install, not a multi-user public AI service.

## 3. Get a free-tier key

Try [Groq API keys](https://console.groq.com/keys): create an account, stay on the Free plan and create a key.
Account/model limits apply; free access is not unlimited. Do not upgrade/add billing just for this test.
Paste the key **only into your own Frank settings**, never into this chat or public source.

Gemini is available on the PHP route. A shared public free key is not a guaranteed free service: visitors share quota, and Google requires Paid Services for API clients offered in the EEA, UK and Switzerland. See https://ai.google.dev/gemini-api/terms.

## 4. Connect and test text first

Connect text chat first:
1. Open `https://YOUR-DOMAIN/frank/frank.php` in Chrome or Edge, and sign in with your new Frank password.
2. Click **Connect AI** → choose **Groq**.
3. Paste the API key. Click **Save key**; Frank checks the current model list.
4. Close settings. Send “Hi Frank, can you hear me at the bins?” as a **typed message**.
5. A successful key/model check turns the LED green and enables the chat controls. If the model is unavailable, use **Load models**, choose a current text-chat model and save. Errors stay visible; Frank does not silently fake an AI answer.

Your key stays in a private server file, not the webpage or browser storage. It is not encrypted on the server. Your provider receives messages, a bounded recent history, quote and relevant saved memory. Chat history/notes remain in this browser; they do not automatically sync to your phone.

## 5. Frank’s character

Open **Settings → Frank’s character** to adjust reply length, humour, roughness and how opinionated he is. Optional writing preferences apply to your next AI reply. These settings do not change his abilities or access.

The hosted version needs no Node.js or terminal: the page and PHP bridge run together on your host.

## Small useful checks

**Settings → Storage & history** shows saved-text size, message count and optional JavaScript heap estimates. Toggle **Show live usage in this browser tab’s title** for a compact live readout. Heap is approximate and Chromium-only when supported; it is not total tab RAM or CPU. A normal webpage cannot read Activity Monitor or enforce a RAM cap. No helper/extension is installed.

Low/Medium/High/Extra high set saved-history ceilings. Lowering a profile previews deletion before applying. Your explicit facts and notes are protected. Offline artwork cache and server keys are outside this saved-text budget.

## If something fails

- **Preview / provider disabled:** you opened `app.html`. Open `frank.php` instead.
- **Private config missing:** place it beside public_html, not inside the `frank` app folder.
- **PHP source appears/downloads:** stop and ask SiteGround to enable PHP handling; never add a real secret to a public file.
- **503 cURL/mbstring:** enable those PHP extensions in hosting, or ask SiteGround support.
- **401 sign in:** reload `frank.php` and sign in again. A provider-key rejection is a different error: check that provider's key/model.
- **429:** a provider or your daily attempt cap was reached. No automatic retries or paid fallback happen.
- **No microphone:** check Chrome/Edge site permissions and OS microphone access; a normal page refresh can clear a stuck recognition service.
- **Installed PWA:** the hosted manifest starts at frank.php. Private HTML/API are never cached. If the private entry cannot reach the network, its service worker can open the cached disconnected shell instead; connected AI still needs internet. You will be asked to sign in when your browser session expires.

## Optional local route

If you later prefer keys to remain on your computer, install Node.js 20+ and double-click `start.bat` (Windows) or `start.command` (macOS), then open the local address it prints. macOS may require permission to run a downloaded script. The local bridge supports Groq, OpenAI, Anthropic, NVIDIA and Ollama. Ollama needs a locally installed model and is deliberately unavailable from the hosted bridge.

## Official references

- [Groq quickstart](https://console.groq.com/docs/quickstart)
- [Groq free-plan/account rate limits](https://console.groq.com/docs/rate-limits)
- [SiteGround File Manager](https://www.siteground.com/kb/manage-files-file-manager)
- [SiteGround Protected URLs](https://www.siteground.com/kb/password-protect-url)
- [Google Gemini available regions](https://ai.google.dev/gemini-api/docs/available-regions)
- [JavaScript heap estimate limitations](https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory)

## GitHub

Yes: put the editable app source, PHP bridge, placeholder config template and docs in a GitHub repository. The included .gitignore excludes real private folders, environment files and generated key/usage files. Keep your actual frank-private folder outside both public_html and your repository. The placeholder php-config/config.php must stay a placeholder in source control.

GitHub Pages can host the static character preview, but cannot run this PHP bridge. For your personal connected version, open the SiteGround URL instead. Do not mix a local file/GitHub Pages frontend with a remote backend URL: the shipped private bridge deliberately accepts only its own origin. Co-hosting needs no CORS configuration and keeps setup simpler.

## Updating

The public demo contains a short scripted chat and character settings. It cannot save provider keys or make AI requests. Install the private version to connect your own provider. A successful key/model check enables connected chat; quota or permissions can still cause later requests to fail.

Upload the new app files over the old ones, preserving your private configuration and data. In an installed PWA, use **Settings → App & install → Update app**, then reload.

## Upgrade to chat-only v1.5.0

Back up your installation first. Replace the app files, including `frank.php`, `character.php`, `character-spec.json` and the `bridge` folder. Keep your real private configuration, saved provider keys and usage files outside the public folder unchanged. No new password is needed.

Delete old `voice.js`, `demo-call.js`, `demo-call.css`, `call.html` and `demo-1.mp3` through `demo-5.mp3` from the web root. They are preserved in the separate archive, not used by this release. Close old app tabs and reopen, or use Update app when offered.

Character controls change writing only. “Try with my AI” uses one request and is not saved to chat or memory. Model quality still needs checking with your chosen provider.
