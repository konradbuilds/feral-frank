/* Feral Frank · Konrad Sroka · GPL-3.0-only.
 * Browser preferences contain no API secrets. The optional local bridge owns keys.
 */
(function () {
	"use strict";
	const marker = document.querySelector('meta[name="frank-bridge"]');
	const hosted = marker?.content === "hosted";
	const bridge = hosted || marker?.content === "local";
	const storageKey = "feral-frank-connection-v1";
	let selected = "local",
		state = null,
		requesting = false,
		verified = false,
		verification = 0,
		saving = false;
	try {
		const saved = JSON.parse(window.FrankStorage.read(storageKey) || "{}");
		if (
			[
				"groq",
				"openai",
				"anthropic",
				"nvidia",
				"google",
				"deepseek",
				"openrouter",
				"ollama",
			].includes(saved.provider)
		)
			selected = saved.provider;
	} catch (error) {
		/* Session defaults work without storage. */
	}
	if (!bridge) selected = "local";
	const $ = (id) => document.getElementById(id);
	const entry = () => state?.providers.find((p) => p.id === selected);
	const enabled = () => bridge && selected !== "local";
	const ready = () =>
		enabled() &&
		verified &&
		(selected === "ollama" || navigator.onLine !== false);
	function disconnect() {
		verified = false;
		verification++;
		emit();
	}
	async function verify() {
		const ticket = ++verification;
		verified = false;
		emit();
		if (!enabled() || !entry()?.configured || !entry()?.model) return false;
		const provider = selected,
			model = entry().model;
		$("ai-setup-status").textContent = "Checking your key and model…";
		try {
			const data = await api("models?provider=" + encodeURIComponent(provider));
			if (ticket !== verification) return false;
			if (!data.models.includes(model))
				throw new Error(
					"The selected model is not available. Load models, choose a text-chat model and save again.",
				);
			verified = true;
			$("ai-setup-status").textContent =
				"Connected. Your key and model are available. Chat requests still depend on provider quota.";
			return true;
		} catch (error) {
			if (ticket === verification)
				$("ai-setup-status").textContent = "Not connected. " + error.message;
			return false;
		} finally {
			if (ticket === verification) emit();
		}
	}
	function emit() {
		document.dispatchEvent(
			new CustomEvent("frank:connection", {
				detail: { enabled: enabled(), provider: selected },
			}),
		);
	}
	async function api(route, payload) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 35000);
		try {
			const response = await fetch(
				hosted ? "frank.php?api=" + route.replace("?", "&") : "/api/" + route,
				{
					method: payload ? "POST" : "GET",
					credentials: "same-origin",
					cache: "no-store",
					signal: controller.signal,
					headers: payload
						? {
								"Content-Type": "application/json",
								...(hosted
									? {
											"X-Frank-CSRF": document.querySelector(
												'meta[name="frank-csrf"]',
											).content,
										}
									: {}),
							}
						: {},
					body: payload ? JSON.stringify(payload) : undefined,
				},
			);
			const data = await response.json();
			if (data.usage && state) state.usage = data.usage;
			if (!response.ok)
				throw new Error(
					data.error || "The local bridge rejected this request.",
				);
			return data;
		} catch (error) {
			if (error.name === "AbortError")
				throw new Error("The request timed out. No automatic retry was made.");
			if (error instanceof TypeError)
				throw new Error(
					hosted
						? "The server is unavailable. Reload frank.php and sign in again if asked."
						: "The local bridge is unavailable. Keep its terminal open, then try again.",
				);
			throw error;
		} finally {
			clearTimeout(timer);
			renderUsage();
		}
	}
	function renderUsage() {
		if (!$("ai-usage") || !state) return;
		const u = state.usage;
		const capped = Number.isInteger(u.dailyLimit) && u.dailyLimit > 0;
		$("ai-usage").textContent =
			`${u.attempts}${capped ? " / " + u.dailyLimit : ""} attempts today (UTC) · ${u.inputTokens + u.outputTokens} reported tokens. ${capped ? (u.attempts >= u.dailyLimit ? "Daily cap reached." : "") : "App cap off."}`;
		const showCap = enabled() && capped;
		$("ai-budget-notice").hidden = !showCap;
		$("ai-budget-notice").textContent = !showCap ? "" :
			u.attempts >= u.dailyLimit
				? "Daily AI attempt cap reached. Adjust it in Settings or wait for tomorrow."
				: `${u.attempts} / ${u.dailyLimit} daily AI attempts used.`;
		$("f").closest("footer").classList.toggle("has-budget-notice", showCap);

		$("ai-daily-limit").value = u.dailyLimit;
		$("ai-token-limit").value = u.maxTokens;
	}
	function render() {
		const p = entry();
		$("ai-provider").value = selected;
		if (entry()) {
		}
		$("ai-fields").hidden = !bridge || selected === "local";
		$("ai-key-row").hidden = selected === "ollama";
		$("ai-model").value = p?.model || "";
		$("ai-key").value = "";
		$("ai-model-options").replaceChildren();
		$("ai-forget-key").disabled =
			!p?.configured || p?.environmentKey || selected === "ollama";
		$("ai-setup-status").textContent = !bridge
			? "Already installed? Open frank.php in this folder and sign in. app.html is the public demo and cannot save API keys."
			: !state
				? "Connecting to your private AI bridge…"
				: selected === "local"
					? "Choose a provider and add your API key to connect."
					: p?.environmentKey
						? "Key supplied by the server environment. Choose a model below."
						: selected === "ollama"
							? "Run Ollama on this computer, install a model, then load its models. No API key."
							: p?.configured
								? "Key saved privately on the server. Save to check your selected model."
								: "Add this provider’s API key once. Leave it blank later to keep the saved key.";
		renderUsage();
	}
	async function chat(message, history, memory, quote) {
		if (requesting || saving)
			throw new Error("Wait for the current request to finish.");
		if (!ready()) throw new Error("Connect AI in Settings first.");
		if (!state)
			throw new Error(
				"The AI bridge has not connected. Reload this page and reopen AI connection settings.",
			);
		if (!entry()?.configured || !entry()?.model)
			throw new Error(
				"Save a key and choose a model in AI connection settings first.",
			);
		requesting = true;
		document.dispatchEvent(new CustomEvent("frank:thinking", { detail: true }));
		try {
			return await api("chat", {
				provider: selected,
				message,
				history,
				memory,
				quote,
				character: { ...window.FrankCharacter.get(), energy: window.FrankState?.energy(), thankfulness: window.FrankState?.thankfulness() },
			});
		} catch (error) {
			disconnect();
			$("ai-setup-status").textContent =
				"Not connected. " + error.message + " Save & connect to retry.";
			throw error;
		} finally {
			requesting = false;
			document.dispatchEvent(
				new CustomEvent("frank:thinking", { detail: false }),
			);
		}
	}
	window.FrankConnection = {
		enabled,
		ready,
		verify,
		chat,
		provider: () => selected,
		available: () => bridge,
	};
	window.addEventListener("offline", () => {
		if (selected !== "ollama") disconnect();
	});
	window.addEventListener("online", () => {
		if (!requesting && !saving) void verify();
	});
	document.addEventListener("DOMContentLoaded", async () => {
		$("ai-provider").disabled = !bridge;
		render();
		emit();
		$("ai-provider").addEventListener("change", () => {
			if (requesting || saving) {
				$("ai-provider").value = selected;
				$("ai-setup-status").textContent =
					"Wait for the reply before switching.";
				return;
			}
			disconnect();
			selected = $("ai-provider").value;
			try {
				window.FrankStorage.write(
					storageKey,
					JSON.stringify({ provider: selected }),
				);
			} catch (error) {
				/* Keep selection for this tab. */
			}
			render();
			void verify();
		});
		async function settings(forgetKey, loadOnly = false) {
			if (requesting || saving)
				throw new Error("Wait for the current request to finish.");
			saving = true;
			disconnect();
			try {
				state = await api("settings", {
					provider: selected,
					key: forgetKey || /^[*•●]+$/u.test($("ai-key").value.trim()) ? "" : $("ai-key").value,
					forgetKey: !!forgetKey,
					model: $("ai-model").value.trim(),
					dailyLimit: Number($("ai-daily-limit").value),
					maxTokens: Number($("ai-token-limit").value),
				});
				render();
				if (!forgetKey && !loadOnly && !(await verify()))
					throw new Error($("ai-setup-status").textContent);
			} finally {
				saving = false;
				emit();
			}
		}

		// Model names go stale, so none are hardcoded: save the key, ask the
		// provider what it offers, then pick a text-chat model from that list.
		const NOT_CHAT =
			/whisper|tts|speech|audio|embed|rerank|moderation|guard|image|vision|video|ocr/i;
		function pickModel(models) {
			const usable = models.filter((id) => !NOT_CHAT.test(id));
			const pool = usable;
			return (
				pool.find((id) => /instruct|chat|flash|mini|versatile/i.test(id)) ||
				pool[0] ||
				""
			);
		}
		window.FrankConnection.configureFree = async (key, provider) => {
			if (!bridge || !state)
				throw new Error("Open your hosted frank.php and sign in first.");
			if (requesting || saving) throw new Error("Wait for the current reply.");
			const id = provider || "groq";
			if (!state.providers.some((p) => p.id === id))
				throw new Error("That provider is not available on this server.");
			const savedProvider = state.providers.find((p) => p.id === id);
			const suppliedKey = key.trim();
			const masked = /^[*•●]+$/u.test(suppliedKey);
			if ((!suppliedKey || masked) && !savedProvider.configured)
				throw new Error("Paste your API key first.");
			// Select directly: dispatching change also launched a competing verification.
			disconnect();
			selected = id;
			try {
				window.FrankStorage.write(storageKey, JSON.stringify({ provider: id }));
			} catch (error) { /* Keep selection for this tab. */ }
			render();
			$("ai-key").value = masked ? "" : suppliedKey;
			try {
				// Save the key first so the model list can be requested with it.
				await settings(false, true);
				{
					const data = await api("models?provider=" + encodeURIComponent(id));
					const offered = data.models || [];
					const current = $("ai-model").value.trim();
					const chosen = offered.includes(current)
						? current
						: pickModel(offered);
					if (!chosen)
						throw new Error(
							"Key saved, but this provider listed no models. Choose one in Advanced AI settings.",
						);
					$("ai-model").value = chosen;
				}
				await settings(false);
			} catch (error) {
				throw new Error(
					"Connection check failed. " +
						error.message +
						" Your key may already be saved; you can retry from Advanced AI settings.",
				);
			} finally {
				$("ai-key").value = "";
			}
		};
		$("ai-save-limits").addEventListener("click", async () => {
			const button = $("ai-save-limits");
			if (requesting || saving) return;
			saving = true;
			button.disabled = true;
			try {
				// Deliberately omit key/model: limits never replace credentials or call AI.
				state = await api("settings", {
					provider: selected,
					dailyLimit: Number($("ai-daily-limit").value),
					maxTokens: Number($("ai-token-limit").value),
				});
				renderUsage();
				$("ai-limits-status").textContent = "Settings saved. Your API key is unchanged.";
			} catch (error) {
				$("ai-limits-status").textContent = error.message;
			} finally {
				saving = false;
				button.disabled = false;
				emit();
			}
		});
		$("ai-save").addEventListener("click", async () => {
			const button = $("ai-save");
			button.disabled = true;
			try {
				await settings(false);
				$("ai-setup-status").textContent =
					"Connected. Your key and model passed the connection check.";
			} catch (error) {
				$("ai-setup-status").textContent = error.message;
			} finally {
				$("ai-key").value = "";
				button.disabled = false;
				if (!$("memory-panel").hidden) button.focus();
			}
		});
		$("ai-models").addEventListener("click", async () => {
			const button = $("ai-models");
			button.disabled = true;
			try {
				if ($("ai-key").value) await settings(false, true);
				const provider = selected;
				const data = await api(
					"models?provider=" + encodeURIComponent(provider),
				);
				if (provider !== selected) return;
				$("ai-model-options").replaceChildren();
				data.models.forEach((id) => {
					const option = document.createElement("option");
					option.value = id;
					$("ai-model-options").appendChild(option);
				});
				$("ai-setup-status").textContent = data.models.length
					? "Models loaded. Choose a text-chat model below and save. Listed models may have different access or costs."
					: "No models found. Check your provider or enter a model ID.";
				$("ai-model").focus();
			} catch (error) {
				$("ai-setup-status").textContent = error.message;
			} finally {
				button.disabled = false;
			}
		});
		$("ai-forget-key").addEventListener("click", async () => {
			try {
				await settings(true);
				$("ai-setup-status").textContent =
					"Saved key removed from the private server.";
			} catch (error) {
				$("ai-setup-status").textContent = error.message;
			}
		});
		if (bridge) {
			try {
				state = await api("status");
				for (const option of $("ai-provider").options) {
					if (option.value !== "local")
						option.disabled = !state.providers.some(
							(p) => p.id === option.value,
						);
				}
				if (selected !== "local" && !entry()) selected = "local";
				render();
				await verify();
			} catch (error) {
				$("ai-setup-status").textContent = error.message;
			}
		}
	});
})();
