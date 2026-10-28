/* Feral Frank · Konrad Sroka · GPL-3.0-only. Explicit style, separate from memory. */
(function () {
	"use strict";
	const $ = (id) => document.getElementById(id);
	const key = "feral-frank-character-v1";
	const defaults = {
		length: 0,
		humour: 1,
		roughness: 1,
		opinion: 0,
		notes: "",
	};
	const labels = {
		length: ["Short", "Balanced", "Detailed"],
		humour: ["Low", "Medium", "High"],
		roughness: ["Gentle", "Rough-edged", "Very rough"],
		opinion: ["Low", "Balanced", "High"],
	};
	const hints = {
		length: [
			"3–9 words total. Usually one sentence.",
			"A concise answer with useful context.",
			"More reasoning and practical steps.",
		],
		humour: [
			"Plain and warm.",
			"A little dry humour.",
			"More playful, when it fits.",
		],
		roughness: [
			"Considerate wording. No swearing.",
			"Direct, with the occasional swear.",
			"Blunter language. Never abusive.",
		],
		opinion: [
			"Quiet company. Advice when asked.",
			"Offers a view when useful.",
			"Readily gives a reasoned view. Never fake certainty.",
		],
	};
	let prefs = { ...defaults },
		revision = 0,
		busy = false;
	try {
		const raw = JSON.parse(window.FrankStorage.read(key) || "{}");
		if (raw && typeof raw === "object" && !Array.isArray(raw)) {
			if (raw.roughness === undefined) raw.roughness = raw.swearing;
			Object.keys(labels).forEach((k) => {
				if (Number.isInteger(raw[k]) && raw[k] >= 0 && raw[k] <= 2)
					prefs[k] = raw[k];
			});
			if (typeof raw.notes === "string") prefs.notes = raw.notes.slice(0, 600);
		}
	} catch (error) {
		/* Defaults work without storage. */
	}
	window.FrankCharacter = { get: () => ({ ...prefs }) };
	function paint() {
		Object.keys(labels).forEach((k) => {
			$("character-" + k).value = prefs[k];
			$("character-" + k).setAttribute("aria-valuetext", labels[k][prefs[k]]);
			$("character-" + k + "-value").textContent = labels[k][prefs[k]];
			$("character-" + k + "-hint").textContent = hints[k][prefs[k]];
		});
		$("character-notes").value = prefs.notes;
		const plain = ["Yeah. That sounds exhausting.", "Yeah. That sounds bloody exhausting.", "Yeah. That sounds fucking exhausting."][prefs.roughness];
		const dry = ["Death by a thousand tiny fixes.", "Bloody death by a thousand tiny fixes.", "Fucking death by a thousand tiny fixes."][prefs.roughness];
		const playful = ["The bugs have clearly unionised.", "The bloody bugs have clearly unionised.", "The fucking bugs have clearly unionised."][prefs.roughness];
		const example = [plain, dry, playful][prefs.humour];
		// Short examples never stack sentences to demonstrate every control.
		const detail = prefs.length === 0 ? "" : " No pep talk. Some days are just a slog.";
		$("character-example").textContent = example + detail;
		$("character-try").disabled = busy || !window.FrankConnection?.ready();
	}
	function save() {
		revision++;
		$("character-result").hidden = true;
		try {
			window.FrankStorage.write(key, JSON.stringify(prefs));
			$("character-status").textContent =
				"Saved here. Applies to your next AI reply.";
		} catch (error) {
			$("character-status").textContent =
				"Storage unavailable or full. Changes last for this tab only.";
		}
		paint();
	}
	Object.keys(labels).forEach((k) =>
		$("character-" + k).addEventListener("input", (e) => {
			prefs[k] = Number(e.target.value);
			save();
		}),
	);
	$("character-notes").addEventListener("input", (e) => {
		prefs.notes = e.target.value.slice(0, 600);
		save();
	});
	$("character-reset").addEventListener("click", () => {
		prefs = { ...defaults };
		save();
		$("character-status").textContent =
			"Defaults restored. Chat and memory kept.";
	});
	$("character-try").addEventListener("click", async () => {
		if (busy || !window.FrankConnection?.ready()) return;
		busy = true;
		const token = revision;
		paint();
		$("character-result").hidden = false;
		$("character-result").textContent = "Trying your settings…";
		try {
			const reply = await window.FrankConnection.chat(
				"I’ve been fixing tiny bugs all day.",
				[],
				{},
				"",
			);
			if (token === revision)
				$("character-result").textContent =
					reply.reply || reply.text || "No reply returned.";
		} catch (error) {
			if (token === revision) $("character-result").textContent = error.message;
		} finally {
			busy = false;
			paint();
		}
	});
	document.addEventListener("frank:connection", paint);
	paint();
})();
