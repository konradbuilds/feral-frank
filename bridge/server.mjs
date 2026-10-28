import { characterPrompt, characterContext } from "./character.mjs";
/** Feral Frank · Konrad Sroka · GPL-3.0-only.
 * Personal, loopback-only provider bridge. No dependencies; Node.js 20+.
 * Provider secrets live outside the served app. Never expose this server publicly.
 */
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, "..");
const PROVIDERS = {
	groq: {
		label: "Groq · free tier available",
		env: "GROQ_API_KEY",
		url: "https://api.groq.com/openai/v1/chat/completions",
		models: "https://api.groq.com/openai/v1/models",
	},
	openai: {
		label: "OpenAI · GPT",
		env: "OPENAI_API_KEY",
		url: "https://api.openai.com/v1/responses",
		models: "https://api.openai.com/v1/models",
	},
	anthropic: {
		label: "Anthropic · Claude",
		env: "ANTHROPIC_API_KEY",
		url: "https://api.anthropic.com/v1/messages",
		models: "https://api.anthropic.com/v1/models",
	},
	nvidia: {
		label: "NVIDIA · NIM",
		env: "NVIDIA_API_KEY",
		url: "https://integrate.api.nvidia.com/v1/chat/completions",
		models: "https://integrate.api.nvidia.com/v1/models",
	},
	ollama: {
		label: "Local · Ollama",
		env: "",
		url: "http://127.0.0.1:11434/v1/chat/completions",
		models: "http://127.0.0.1:11434/api/tags",
	},
};
const modelOK = (value) =>
	typeof value === "string" &&
	/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,119}$/.test(value);
const bounded = (value, min, max, fallback) =>
	Number.isInteger(value) && value >= min && value <= max ? value : fallback;
const day = () => new Date().toISOString().slice(0, 10);
class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

export async function createFrankServer(options = {}) {
	const fetcher = options.fetchImpl || fetch;
	const dataDir =
		options.dataDir || path.join(os.homedir(), ".config", "feral-frank");
	const root = options.publicDir || PUBLIC;
	const session = crypto.randomBytes(32).toString("hex");
	let busy = false,
		settingsBusy = false,
		lastRequest = 0;
	await fs.mkdir(dataDir, { recursive: true, mode: 0o700 });
	async function readJSON(name, fallback) {
		try {
			const file = path.join(dataDir, name),
				info = await fs.lstat(file);
			if (!info.isFile() || info.isSymbolicLink() || info.size > 65536)
				throw new Error("Invalid private file");
			return JSON.parse(await fs.readFile(file, "utf8"));
		} catch (error) {
			if (error.code === "ENOENT") return fallback;
			throw error;
		}
	}
	async function writeJSON(name, data) {
		const target = path.join(dataDir, name),
			temp = target + "." + crypto.randomBytes(8).toString("hex") + ".tmp";
		try {
			await fs.writeFile(temp, JSON.stringify(data, null, 2) + "\n", {
				mode: 0o600,
				flag: "wx",
			});
			await fs.rename(temp, target);
			await fs.chmod(target, 0o600);
		} finally {
			await fs.unlink(temp).catch(() => {});
		}
	}
	const saved = await readJSON("providers.json", {});
	let config = {
		providers: {},
		dailyLimit: bounded(saved.dailyLimit, 0, 500, 0),
		maxTokens: bounded(saved.maxTokens, 128, 1024, 512),
	};
	for (const [id, p] of Object.entries(PROVIDERS)) {
		const entry = saved.providers?.[id] || {};
		config.providers[id] = {
			key: typeof entry.key === "string" ? entry.key.slice(0, 1000) : "",
			model: modelOK(entry.model)
				? entry.model
				: id === "groq"
					? "llama-3.3-70b-versatile"
					: "",
		};
	}
	let usage = await readJSON("usage.json", {
		day: day(),
		attempts: 0,
		inputTokens: 0,
		outputTokens: 0,
	});
	usage = {
		day: typeof usage.day === "string" ? usage.day : day(),
		attempts: bounded(usage.attempts, 0, 100000, 0),
		inputTokens: bounded(usage.inputTokens, 0, 1e9, 0),
		outputTokens: bounded(usage.outputTokens, 0, 1e9, 0),
	};
	function keyFor(id) {
		return (
			(PROVIDERS[id].env && process.env[PROVIDERS[id].env]) ||
			config.providers[id].key
		);
	}
	function currentUsage() {
		if (usage.day !== day())
			usage = {
				day: day(),
				attempts: 0,
				inputTokens: 0,
				outputTokens: 0,
			};
		return {
			...usage,
			dailyLimit: config.dailyLimit,
			maxTokens: config.maxTokens,
		};
	}
	function status() {
		return {
			bridge: true,
			usage: currentUsage(),
			providers: Object.entries(PROVIDERS).map(([id, p]) => ({
				id,
				label: p.label,
				configured: id === "ollama" || !!keyFor(id),
				model: config.providers[id].model,
				environmentKey: !!(p.env && process.env[p.env]),
			})),
		};
	}
	function headers(id) {
		return {
			"Content-Type": "application/json",
			...(id === "ollama" ? {} : { Authorization: "Bearer " + keyFor(id) }),
			...(id === "anthropic" ? { "anthropic-version": "2023-06-01" } : {}),
		};
	}
	async function upstream(url, init, signal) {
		const controller = new AbortController(),
			cancel = () => controller.abort();
		signal?.addEventListener("abort", cancel, { once: true });
		const timer = setTimeout(cancel, 30000);
		try {
			const response = await fetcher(url, {
				...init,
				signal: controller.signal,
			});
			if (!response.ok)
				throw new HttpError(
					response.status === 401 || response.status === 403
						? 401
						: response.status === 429
							? 429
							: 502,
					response.status === 401 || response.status === 403
						? "The provider rejected this key or model access. Check AI settings."
						: response.status === 429
							? "The provider reported a rate or credit limit. No automatic retry was made."
							: "The provider could not complete this request. No automatic retry was made.",
				);
			const data = await response.json();
			return data;
		} catch (error) {
			if (error instanceof HttpError) throw error;
			throw new HttpError(
				502,
				controller.signal.aborted
					? "The AI request timed out or was cancelled."
					: "Could not reach the selected provider. Check its connection and model.",
			);
		} finally {
			clearTimeout(timer);
			signal?.removeEventListener("abort", cancel);
		}
	}
	async function body(req) {
		let size = 0;
		const chunks = [];
		for await (const chunk of req) {
			size += chunk.length;
			if (size > 65536) throw new HttpError(413, "Request too large.");
			chunks.push(chunk);
		}
		try {
			const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
			if (!data || typeof data !== "object" || Array.isArray(data))
				throw new Error("Object required");
			return data;
		} catch {
			throw new HttpError(400, "Invalid JSON object.");
		}
	}
	function json(res, code, data) {
		res.writeHead(code, {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		});
		res.end(JSON.stringify(data));
	}
	const server = http.createServer(async (req, res) => {
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.setHeader("Referrer-Policy", "no-referrer");
		res.setHeader("X-Frame-Options", "DENY");
		res.setHeader(
			"Content-Security-Policy",
			"frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
		);
		const port = server.address()?.port;
		const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
		try {
			if (!hosts.has(req.headers.host?.toLowerCase()))
				throw new HttpError(403, "Only this local app can use the bridge.");
			const origin = "http://" + req.headers.host;
			const url = new URL(req.url, origin);
			if (url.pathname.startsWith("/api/")) {
				if (req.headers["sec-fetch-site"] === "cross-site")
					throw new HttpError(403, "Cross-site access is blocked.");
				if (req.method === "POST") {
					if (
						req.headers.origin !== origin ||
						req.headers["content-type"]?.split(";")[0] !== "application/json" ||
						!req.headers.cookie
							?.split(";")
							.some((c) => c.trim() === `frank_session=${session}`)
					)
						throw new HttpError(
							403,
							"Reload this local app before changing settings or chatting.",
						);
				}
				if (req.method === "GET" && url.pathname === "/api/status") {
					res.setHeader(
						"Set-Cookie",
						`frank_session=${session}; HttpOnly; SameSite=Strict; Path=/`,
					);
					return json(res, 200, status());
				}
				if (req.method === "POST" && url.pathname === "/api/settings") {
					if (busy || settingsBusy)
						throw new HttpError(
							409,
							"Wait for the current reply before changing providers.",
						);
					settingsBusy = true;
					try {
						const data = await body(req);
						const next = JSON.parse(JSON.stringify(config));
						if (data.provider) {
							if (!Object.hasOwn(PROVIDERS, data.provider))
								throw new HttpError(400, "Unknown provider.");
							const entry = next.providers[data.provider];
							if (data.key !== undefined) {
								if (
									typeof data.key !== "string" ||
									data.key.length > 1000 ||
									/[\r\n]/.test(data.key)
								)
									throw new HttpError(400, "Invalid key.");
								if (data.key.trim()) entry.key = data.key.trim();
							}
							if (data.forgetKey === true) entry.key = "";
							if (data.model !== undefined) {
								if (data.model !== "" && !modelOK(data.model))
									throw new HttpError(400, "Invalid model identifier.");
								entry.model = data.model;
							}
						}
						if (data.dailyLimit !== undefined) {
							const n = bounded(data.dailyLimit, 0, 500, null);
							if (n === null)
								throw new HttpError(400, "Daily limit must be 0 (off) or 1–500 attempts.");
							next.dailyLimit = n;
						}
						if (data.maxTokens !== undefined) {
							const n = bounded(data.maxTokens, 128, 1024, null);
							if (!n)
								throw new HttpError(
									400,
									"Reply limit must be 128–1024 tokens.",
								);
							next.maxTokens = n;
						}
						await writeJSON("providers.json", next);
						config = next;
						return json(res, 200, status());
					} finally {
						settingsBusy = false;
					}
				}
				if (req.method === "GET" && url.pathname === "/api/models") {
					const id = url.searchParams.get("provider");
					if (!Object.hasOwn(PROVIDERS, id))
						throw new HttpError(400, "Unknown provider.");
					if (id !== "ollama" && !keyFor(id))
						throw new HttpError(400, "Save this provider’s key first.");
					const data = await upstream(PROVIDERS[id].models, {
						headers: headers(id),
					});
					const ids =
						(id === "ollama"
							? data.models?.map((m) => m.name)
							: data.data?.map((m) => m.id)) || [];
					return json(res, 200, {
						models: [...new Set(ids.filter(modelOK))].sort().slice(0, 500),
					});
				}
				if (req.method === "POST" && url.pathname === "/api/chat") {
					if (settingsBusy)
						throw new HttpError(
							409,
							"Settings are saving. Try again in a moment.",
						);
					const data = await body(req),
						id = data.provider;
					if (!Object.hasOwn(PROVIDERS, id))
						throw new HttpError(400, "Choose a provider.");
					const model = config.providers[id].model;
					if (!modelOK(model) || (id !== "ollama" && !keyFor(id)))
						throw new HttpError(
							400,
							"Save a key and model for this provider in AI settings.",
						);
					if (
						typeof data.message !== "string" ||
						!data.message.trim() ||
						data.message.length > 2500
					)
						throw new HttpError(400, "Message must contain 1–2500 characters.");
					if (busy || settingsBusy)
						throw new HttpError(
							409,
							"A reply or settings save is already in progress.",
						);
					if (Date.now() - lastRequest < 1500)
						throw new HttpError(
							429,
							"Give Frank a moment before the next request.",
						);
					currentUsage();
					if (config.dailyLimit > 0 && usage.attempts >= config.dailyLimit)
						throw new HttpError(
							429,
							"The local daily attempt cap is reached. Change it deliberately in AI settings, or use local mode.",
						);
					busy = true;
					lastRequest = Date.now();
					const controller = new AbortController();
					res.once("close", () => {
						if (!res.writableEnded) controller.abort();
					});
					try {
						usage.attempts++;
						await writeJSON("usage.json", usage);
						const history = Array.isArray(data.history)
							? data.history
									.filter(
										(m) =>
											["user", "assistant"].includes(m?.role) &&
											typeof m.content === "string",
									)
									.slice(-12)
									.map((m) => ({
										role: m.role,
										content: m.content.slice(0, 2000),
									}))
							: [];
						if (
							history.at(-1)?.role === "user" &&
							history.at(-1).content === data.message
						)
							history.pop();
						history.unshift({
							role: "user",
							content: characterContext(data.character, data.memory),
						});
						const instructions = characterPrompt(data.character);
						const message =
							typeof data.quote === "string"
								? "Replying to this quoted message: " +
									data.quote.slice(0, 500) +
									"\n\n" +
									data.message
								: data.message;
						const messages = history.concat({
							role: "user",
							content: message,
						});
						const payload =
							id === "openai"
								? {
										model,
										instructions,
										input: messages,
										max_output_tokens: config.maxTokens,
										store: false,
									}
								: id === "anthropic"
									? {
											model,
											system: instructions,
											messages,
											max_tokens: config.maxTokens,
										}
									: {
											model,
											messages: [
												{
													role: "system",
													content: instructions,
												},
												...messages,
											],
											max_tokens: config.maxTokens,
											stream: false,
										};
						const response = await upstream(
							PROVIDERS[id].url,
							{
								method: "POST",
								headers: headers(id),
								body: JSON.stringify(payload),
							},
							controller.signal,
						);
						const reply =
							id === "openai"
								? response.output
										?.flatMap((m) => m.content || [])
										.filter((c) => c.type === "output_text")
										.map((c) => c.text)
										.join("\n")
								: id === "anthropic"
									? response.content
											?.filter((c) => c.type === "text")
											.map((c) => c.text)
											.join("\n")
									: response.choices?.[0]?.message?.content;
						if (typeof reply !== "string" || !reply.trim())
							throw new HttpError(
								502,
								"The model returned no readable reply. Try another model; no automatic retry was made.",
							);
						const u = response.usage || {};
						usage.inputTokens += Number(u.input_tokens ?? u.prompt_tokens) || 0;
						usage.outputTokens +=
							Number(u.output_tokens ?? u.completion_tokens) || 0;
						await writeJSON("usage.json", usage);
						return json(res, 200, {
							reply: reply.trim().slice(0, 4000),
							provider: id,
							model,
							usage: currentUsage(),
						});
					} finally {
						busy = false;
					}
				}
				throw new HttpError(404, "Unknown bridge route.");
			}
			if (!["GET", "HEAD"].includes(req.method))
				throw new HttpError(405, "Method not allowed.");
			const name = decodeURIComponent(
				url.pathname === "/" ? "/app.html" : url.pathname,
			);
			if (
				name.startsWith("/bridge/") ||
				name.includes("/.") ||
				!/\.(?:html|css|js|json|png|svg|webmanifest|txt|md|mp3)$/.test(name)
			)
				throw new HttpError(404, "File not found.");
			const file = path.resolve(root, "." + name);
			if (!file.startsWith(root + path.sep))
				throw new HttpError(404, "File not found.");
			let data = await fs.readFile(file);
			const ext = path.extname(file);
			if (ext === ".html")
				data = Buffer.from(
					data
						.toString("utf8")
						.replace(
							"<head>",
							'<head><meta name="frank-bridge" content="local" />',
						),
				);
			const mime = {
				".html": "text/html",
				".js": "text/javascript",
				".css": "text/css",
				".mp3": "audio/mpeg",
				".png": "image/png",
				".svg": "image/svg+xml",
				".json": "application/json",
				".webmanifest": "application/manifest+json",
			};
			res.writeHead(200, {
				"Content-Type":
					(mime[ext] || "text/plain") +
					([".html", ".js", ".css", ".json"].includes(ext)
						? "; charset=utf-8"
						: ""),
				"Cache-Control": "no-cache",
			});
			res.end(req.method === "HEAD" ? undefined : data);
		} catch (error) {
			if (!res.headersSent && !res.destroyed)
				json(
					res,
					error instanceof HttpError
						? error.status
						: error.code === "ENOENT"
							? 404
							: 500,
					{
						error:
							error instanceof HttpError
								? error.message
								: error.code === "ENOENT"
									? "File not found."
									: "The local bridge could not complete this operation. Check its private storage permissions.",
						usage: currentUsage(),
					},
				);
		}
	});
	return { server, dataDir };
}
if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
	const port = Number(process.env.FRANK_PORT || 8811);
	if (!Number.isInteger(port) || port < 1024 || port > 65535)
		throw new Error("FRANK_PORT must be 1024–65535.");
	const { server, dataDir } = await createFrankServer();
	server.listen(port, "127.0.0.1", () =>
		console.log(
			`Feral Frank: http://127.0.0.1:${port}/\nPrivate provider settings: ${dataDir}\nKeep this terminal open while using connected Frank.`,
		),
	);
}
