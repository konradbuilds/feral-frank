/* Feral Frank · Konrad Sroka · GPL-3.0-only. AI setup. */
(function () {
	"use strict";
	const $ = (id) => document.getElementById(id);
	function feedback(message, kind) {
		const box = $("connect-setup-feedback");
		box.textContent = message;
		box.className = kind ? "setup-feedback is-" + kind : "setup-feedback";
	}
	const KEY_PAGES = {
		groq: ["Groq", "https://console.groq.com/keys"],
		google: ["Google AI Studio", "https://aistudio.google.com/app/apikey"],
		nvidia: ["NVIDIA", "https://build.nvidia.com/"],
		deepseek: ["DeepSeek", "https://platform.deepseek.com/api_keys"],
		openrouter: ["OpenRouter", "https://openrouter.ai/keys"],
		openai: ["OpenAI", "https://platform.openai.com/api-keys"],
		anthropic: ["Anthropic", "https://console.anthropic.com/settings/keys"],
	};
	const PROVIDER_COSTS = {
		groq: "Free tier available · rate limits apply. Paid plans are optional.",
		google:
			"Free tier on selected models · other models and paid-tier usage are billed.",
		nvidia:
			"Limited free access on selected endpoints · check your account’s allowance.",
		deepseek: "Paid API · usage is charged against your balance.",
		openrouter:
			"Free and paid models · choose a free model explicitly; limits apply.",
		openai: "Paid API · billed separately from a ChatGPT subscription.",
		anthropic: "Paid API · billed separately from a Claude subscription.",
	};
	function paintProvider() {
		const page = KEY_PAGES[$("connect-provider").value] || KEY_PAGES.groq;
		$("connect-key-link").textContent = "Get a key from " + page[0] + " ↗";
		$("connect-key-link").href = page[1];
		$("provider-cost").textContent =
			PROVIDER_COSTS[$("connect-provider").value];
	}
	$("connect-provider").addEventListener("change", paintProvider);
	paintProvider();
	$("connect-key-link").addEventListener("click", () => {
		feedback(
			"Opened in another tab. Create a key there, then come back and paste it above.",
			"info",
		);
	});
	$("connect-save").addEventListener("click", async () => {
		const button = $("connect-save");
		button.disabled = true;
		feedback("Connecting…", "info");
		try {
			await window.FrankConnection.configureFree(
				$("connect-key").value,
				$("connect-provider").value,
			);
			$("connect-key").value = "";
			// Saving is its own step: nothing closes, no microphone starts.
			feedback("Frank is connected. Your key is saved privately.", "good");
		} catch (error) {
			feedback(error.message, "bad");
		} finally {
			$("connect-key").value = "";
			button.disabled = false;
		}
	});

	document.addEventListener("frank:thinking", (e) =>
		window.FrankMotion?.thinking(e.detail),
	);
})();
