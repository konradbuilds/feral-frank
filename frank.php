<?php
/**
 * Feral Frank · Konrad Sroka · 2026 · GPL-3.0-only.
 * Personal HTTPS entry point for PHP 8.1+ with cURL. No dependencies.
 * Private config/settings live beside public_html, never inside it.
 * Frank remembers the conversation; the bins keep the paperwork outside.
 */
declare(strict_types=1);
require_once __DIR__ . "/character.php";
ini_set("display_errors", "0");

function frank_json(int $code, array $data): void
{
	http_response_code($code);
	header("Content-Type: application/json; charset=utf-8");
	echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
	exit();
}
function frank_error(int $code, string $message): void
{
	throw new RuntimeException($message, $code);
}
function frank_text($value, int $length): string
{
	return is_string($value) ? mb_substr($value, 0, $length, "UTF-8") : "";
}
function frank_model($model): bool
{
	return is_string($model) &&
		preg_match('/^[a-zA-Z0-9][a-zA-Z0-9._:\/-]{0,119}$/D', $model) === 1;
}
function frank_read(string $path, array $fallback): array
{
	if (!file_exists($path)) {
		return $fallback;
	}
	if (is_link($path) || !is_file($path) || filesize($path) > 65536) {
		frank_error(503, "Private settings need attention. No request was sent.");
	}
	$data = json_decode(
		(string) file_get_contents($path),
		true,
		16,
		JSON_THROW_ON_ERROR,
	);
	if (!is_array($data)) {
		frank_error(503, "Private settings could not be read.");
	}
	return $data;
}
function frank_write(string $path, array $data): void
{
	$temp = $path . "." . bin2hex(random_bytes(8)) . ".tmp";
	try {
		if (
			file_put_contents(
				$temp,
				json_encode($data, JSON_THROW_ON_ERROR),
				LOCK_EX,
			) === false ||
			!chmod($temp, 0600) ||
			!rename($temp, $path)
		) {
			frank_error(
				503,
				"Could not save private settings. Check folder permissions.",
			);
		}
	} finally {
		if (is_file($temp)) {
			unlink($temp);
		}
	}
}
function frank_providers(): array
{
	return [
		"groq" => [
			"label" => "Groq · free tier available",
			"base" => "https://api.groq.com/openai/v1",
		],
		"openai" => ["label" => "OpenAI · GPT", "base" => "https://api.openai.com/v1"],
		"anthropic" => [
			"label" => "Anthropic · Claude",
			"base" => "https://api.anthropic.com/v1",
		],
		"nvidia" => [
			"label" => "NVIDIA · NIM",
			"base" => "https://integrate.api.nvidia.com/v1",
		],
		"google" => [
			"label" => "Google · Gemini, free tier available",
			"base" => "https://generativelanguage.googleapis.com/v1beta/openai",
		],
		"deepseek" => [
			"label" => "DeepSeek",
			"base" => "https://api.deepseek.com/v1",
		],
		// One key, most models: Claude, GPT, Gemini, DeepSeek, Grok, Kimi.
		"openrouter" => [
			"label" => "OpenRouter · one key, most models",
			"base" => "https://openrouter.ai/api/v1",
		],
	];
}
function frank_usage(array $usage, array $config): array
{
	if (($usage["day"] ?? "") !== gmdate("Y-m-d")) {
		$usage = [
			"day" => gmdate("Y-m-d"),
			"attempts" => 0,
			"inputTokens" => 0,
			"outputTokens" => 0,
			"last" => 0,
		];
	}
	return array_merge($usage, [
		"dailyLimit" => $config["dailyLimit"],
		"maxTokens" => $config["maxTokens"],
	]);
}
function frank_status(array $config, array $usage): array
{
	$list = [];
	foreach (frank_providers() as $id => $provider) {
		$list[] = [
			"id" => $id,
			"label" => $provider["label"],
			"configured" => !empty($config["providers"][$id]["key"]),
			"model" =>
				$config["providers"][$id]["model"] ??
				($id === "groq" ? "llama-3.3-70b-versatile" : ""),
			"environmentKey" => false,
		];
	}
	return [
		"bridge" => true,
		"providers" => $list,
		"usage" => frank_usage($usage, $config),
	];
}
function frank_payload(
	string $provider,
	array $data,
	array $config,
	string $persona = "",
): array {
	$history = [];
	foreach (is_array($data["history"] ?? null) ? $data["history"] : [] as $message) {
		if (
			is_array($message) &&
			in_array($message["role"] ?? "", ["user", "assistant"], true) &&
			is_string($message["content"] ?? null)
		) {
			$history[] = [
				"role" => $message["role"],
				"content" => frank_text($message["content"], 2000),
			];
		}
	}
	$history = array_slice($history, -12);
	$last = end($history);
	if ($last && $last["role"] === "user" && $last["content"] === $data["message"]) {
		array_pop($history);
	}
$instructions = frank_character_prompt($data["character"] ?? null);
array_unshift($history, ["role"=>"user", "content"=>frank_character_context($data["character"] ?? null, $data["memory"] ?? null)]);
	$message = is_string($data["quote"] ?? null)
		? "Replying to this quoted message: " .
			frank_text($data["quote"], 500) .
			"\n\n" .
			$data["message"]
		: $data["message"];
	$history[] = ["role" => "user", "content" => $message];
	$model = $config["providers"][$provider]["model"];
	if ($provider === "openai") {
		return [
			"model" => $model,
			"instructions" => $instructions,
			"input" => $history,
			"max_output_tokens" => $config["maxTokens"],
			"store" => false,
		];
	}
	if ($provider === "anthropic") {
		return [
			"model" => $model,
			"system" => $instructions,
			"messages" => $history,
			"max_tokens" => $config["maxTokens"],
		];
	}
	array_unshift($history, ["role" => "system", "content" => $instructions]);
	return [
		"model" => $model,
		"messages" => $history,
		"max_tokens" => $config["maxTokens"],
		"stream" => false,
	];
}
/** Safe diagnostics: never echo upstream bodies, keys or request headers. */
function frank_provider_error(int $code, string $operation): void
{
	$hint = match ($code) {
		401 => "API key was rejected. Create a key for this provider and paste it again.",
		403 => "Access denied. Check provider account permissions or regional restrictions; your host IP may also be blocked.",
		429 => "Provider rate or credit limit reached. Wait or check your provider account.",
		400, 404 => "Check the selected model and provider endpoint.",
		default => "Provider service failed. Try again later or check your hosting connection.",
	};
	frank_error($code === 429 ? 429 : 502, "Provider " . $operation . " failed (HTTP " . $code . "). " . $hint);
}

function frank_upstream(string $id, string $key, ?array $payload = null): array
{
	$providers = frank_providers();
	$suffix =
		$payload === null
			? "/models"
			: ($id === "openai"
				? "/responses"
				: ($id === "anthropic"
					? "/messages"
					: "/chat/completions"));
	$headers = ["Content-Type: application/json", "Authorization: Bearer " . $key];
	if ($id === "anthropic") {
		$headers[] = "anthropic-version: 2023-06-01";
	}
	$curl = curl_init($providers[$id]["base"] . $suffix);
	$body = "";
	curl_setopt_array($curl, [
		CURLOPT_HTTPHEADER => $headers,
		CURLOPT_USERAGENT => "FeralFrank/1.4.1",
		CURLOPT_CONNECTTIMEOUT => 8,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_FOLLOWLOCATION => false,
		CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
		CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (
			&$body,
		): int {
			if (strlen($body) + strlen($chunk) > 2097152) {
				return 0;
			}
			$body .= $chunk;
			return strlen($chunk);
		},
	]);
	if ($payload !== null) {
		curl_setopt_array($curl, [
			CURLOPT_POST => true,
			CURLOPT_POSTFIELDS => json_encode($payload, JSON_THROW_ON_ERROR),
		]);
	}
	$ok = curl_exec($curl);
	$code = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
	curl_close($curl);
	if ($ok === false) {
		frank_error(
			502,
			"Could not reach the provider, or the request timed out. No automatic retry was made.",
		);
	}
	if ($code < 200 || $code >= 300) {
		frank_provider_error($code, $payload === null ? "model list" : "chat");
	}
	$decoded = json_decode($body, true, 32, JSON_THROW_ON_ERROR);
	if (!is_array($decoded)) {
		frank_error(502, "Provider returned no readable response.");
	}
	return $decoded;
}

/**
 * Ask an OpenAI-compatible /audio/speech endpoint for spoken audio.
 * Returns [mime, bytes]. Unlike frank_upstream the body is binary, so it is
 * never JSON decoded.
 */
if (PHP_SAPI === "cli") {
	return;
}
header("Cache-Control: no-store, private");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Referrer-Policy: same-origin");
header(
	"Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
);
$lock = null;
try {
	$https = !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off";
	$loopback =
		in_array($_SERVER["REMOTE_ADDR"] ?? "", ["127.0.0.1", "::1"], true) &&
		preg_match('/^(127\.0\.0\.1|localhost)(:\d+)?$/D', $_SERVER["HTTP_HOST"] ?? "");
	if (!$https && !$loopback) {
		frank_error(403, "Open Frank using HTTPS before signing in.");
	}
	if (!extension_loaded("curl") || !extension_loaded("mbstring")) {
		frank_error(503, "Enable PHP cURL and mbstring in your hosting panel first.");
	}
	$webroot = realpath($_SERVER["DOCUMENT_ROOT"]);
	if (!$webroot) {
		frank_error(503, "The web root could not be verified.");
	}
	$private = dirname($webroot) . "/frank-private";
	$resolved = realpath($private);
	if (
		!$resolved ||
		is_link($private) ||
		$resolved === $webroot ||
		str_starts_with($resolved . "/", $webroot . "/") ||
		str_starts_with($resolved . "/", realpath(__DIR__) . "/")
	) {
		frank_error(
			503,
			"Upload frank-private/config.php outside public_html first. See SETUP.md.",
		);
	}
	$configFile = $private . "/config.php";
	if (!is_file($configFile) || is_link($configFile)) {
		frank_error(503, "Private config.php is missing. See SETUP.md.");
	}
	$privateConfig = require $configFile;
	$password = $privateConfig["password"] ?? "";
	if (
		!is_string($password) ||
		strlen($password) < 16 ||
		str_contains($password, "CHANGE_THIS")
	) {
		frank_error(
			503,
			"Set a unique password of at least 16 characters in the private config.php first.",
		);
	}
	ini_set("session.use_strict_mode", "1");
	session_name("frank_hosted");
	session_set_cookie_params([
		"lifetime" => 0,
		"path" => rtrim(dirname($_SERVER["SCRIPT_NAME"]), "/") . "/",
		"secure" => $https,
		"httponly" => true,
		"samesite" => "Strict",
	]);
	if (!session_start()) {
		frank_error(
			503,
			"PHP session storage is unavailable. Ask your host to enable writable sessions.",
		);
	}
	if (empty($_SESSION["csrf"])) {
		$_SESSION["csrf"] = bin2hex(random_bytes(32));
	}
	$route = $_GET["api"] ?? "";
	$method = $_SERVER["REQUEST_METHOD"];
	if (!is_string($route)) {
		frank_error(400, "Invalid route.");
	}
	if ($method === "POST") {
		$origin = ($https ? "https://" : "http://") . $_SERVER["HTTP_HOST"];
		if (
			($_SERVER["HTTP_ORIGIN"] ?? "") !== $origin ||
			($_SERVER["HTTP_SEC_FETCH_SITE"] ?? "") === "cross-site"
		) {
			frank_error(
				403,
				"Cross-site requests are blocked. Reload Frank at its HTTPS address.",
			);
		}
	}
	// A private shared gate, not a multi-user service. Password changes invalidate sessions.
	$auth = hash("sha256", $password);
	if (!hash_equals($auth, (string) ($_SESSION["auth"] ?? ""))) {
		if ($route !== "") {
			frank_error(401, "Sign in at frank.php, then try again.");
		}
		$notice = "";
		if ($method === "POST") {
			// The file lock makes this limit global across sessions; no unbounded IP/session logs.
			$gate = fopen($private . "/login.lock", "c");
			if (!$gate || !flock($gate, LOCK_EX)) {
				frank_error(503, "Sign-in storage is unavailable.");
			}
			$attempts = frank_read($private . "/login.json", [
				"start" => time(),
				"count" => 0,
			]);
			if (time() - $attempts["start"] >= 60) {
				$attempts = ["start" => time(), "count" => 0];
			}
			$attempts["count"]++;
			frank_write($private . "/login.json", $attempts);
			flock($gate, LOCK_UN);
			fclose($gate);
			if ($attempts["count"] > 10) {
				frank_error(429, "Too many sign-in attempts. Wait one minute.");
			}
			if (
				hash_equals($_SESSION["csrf"], (string) ($_POST["csrf"] ?? "")) &&
				hash_equals($password, (string) ($_POST["password"] ?? ""))
			) {
				session_regenerate_id(true);
				$_SESSION["auth"] = $auth;
				header("Location: frank.php", true, 303);
				exit();
			}
			$notice = "That password did not match. Try again.";
		}
		header("Content-Type: text/html; charset=utf-8");
		$token = htmlspecialchars($_SESSION["csrf"], ENT_QUOTES, "UTF-8");
		echo '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Feral Frank</title><link rel="stylesheet" href="workspace.css"><body class="hosted-login"><main><h1>Back at the bins.</h1><p>Your private Feral Frank. Sign in to connect AI and talk.</p><form method="post" action="frank.php"><label for="password">Your Frank password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><input type="hidden" name="csrf" value="' .
			$token .
			'"><button type="submit">Let me in</button></form><p role="status">' .
			$notice .
			"</p><p>This is the password you chose in your private config file.</p></main></body></html>";
		exit();
	}
	if ($route === "") {
		if ($method !== "GET") {
			frank_error(405, "Method not allowed.");
		}
		header("Content-Type: text/html; charset=utf-8");
		$html = file_get_contents(__DIR__ . "/app.html");
		$html = preg_replace(
			"/<head>/",
			'<head><meta name="frank-bridge" content="hosted" /><meta name="frank-csrf" content="' .
				$_SESSION["csrf"] .
				'" />',
			$html,
			1,
		);
		$html = str_replace(
			'href="manifest.webmanifest"',
			'href="frank.php?api=manifest"',
			$html,
		);
		echo $html;
		exit();
	}
	if ($route === "manifest" && $method === "GET") {
		header("Content-Type: application/manifest+json");
		$manifest = json_decode(
			file_get_contents(__DIR__ . "/manifest.webmanifest"),
			true,
			16,
			JSON_THROW_ON_ERROR,
		);
		$manifest["start_url"] = "./frank.php";
		echo json_encode($manifest);
		exit();
	}
	if ($method === "POST") {
		if (
			strtok($_SERVER["CONTENT_TYPE"] ?? "", ";") !== "application/json" ||
			!hash_equals($_SESSION["csrf"], $_SERVER["HTTP_X_FRANK_CSRF"] ?? "")
		) {
			frank_error(403, "Reload Frank before changing settings or chatting.");
		}
		if ((int) ($_SERVER["CONTENT_LENGTH"] ?? 0) > 65536) {
			frank_error(413, "Request too large.");
		}
		$raw = file_get_contents("php://input", false, null, 0, 65537);
		if (strlen($raw) > 65536) {
			frank_error(413, "Request too large.");
		}
		$data = json_decode($raw, true, 24, JSON_THROW_ON_ERROR);
		if (!is_array($data) || array_is_list($data)) {
			frank_error(400, "Invalid JSON object.");
		}
	}
	session_write_close();
	// One shared lock prevents two tabs/sessions from exceeding caps or overwriting keys.
	$lock = fopen($private . "/provider.lock", "c");
	if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
		frank_error(409, "A reply or settings save is already in progress.");
	}
	$config = frank_read($private . "/providers.json", [
		"providers" => [],
		"dailyLimit" => 50,
		"maxTokens" => 512,
	]);
	$usage = frank_usage(frank_read($private . "/usage.json", []), $config);
	if ($route === "status" && $method === "GET") {
		frank_json(200, frank_status($config, $usage));
	}
	$id = $method === "GET" ? $_GET["provider"] ?? "" : $data["provider"] ?? "";
	if (!is_string($id) || !array_key_exists($id, frank_providers())) {
		frank_error(400, "Choose a supported provider.");
	}
	if ($route === "settings" && $method === "POST") {
		$next = $config;
		$entry = $next["providers"][$id] ?? [
			"key" => "",
			"model" => $id === "groq" ? "llama-3.3-70b-versatile" : "",
		];
		if (isset($data["key"])) {
			if (
				!is_string($data["key"]) ||
				strlen($data["key"]) > 1000 ||
				preg_match('/[\r\n]/', $data["key"])
			) {
				frank_error(400, "Invalid key.");
			}
			if (trim($data["key"]) !== "") {
				$entry["key"] = trim($data["key"]);
			}
		}
		if (($data["forgetKey"] ?? false) === true) {
			$entry["key"] = "";
		}
		if (isset($data["model"])) {
			if ($data["model"] !== "" && !frank_model($data["model"])) {
				frank_error(400, "Invalid model ID.");
			}
			$entry["model"] = $data["model"];
		}

		foreach (
			["dailyLimit" => [1, 500], "maxTokens" => [128, 1024]]
			as $field => $range
		) {
			if (isset($data[$field])) {
				if (
					!is_int($data[$field]) ||
					$data[$field] < $range[0] ||
					$data[$field] > $range[1]
				) {
					frank_error(
						400,
						"The attempt or reply limit is outside its allowed range.",
					);
				}
				$next[$field] = $data[$field];
			}
		}
		$next["providers"][$id] = $entry;
		frank_write($private . "/providers.json", $next);
		frank_json(200, frank_status($next, $usage));
	}
	$key = $config["providers"][$id]["key"] ?? "";
	if (!$key) {
		frank_error(400, "Save this provider’s API key first.");
	}
	if ($route === "models" && $method === "GET") {
		$result = frank_upstream($id, $key);
		$models = array_values(
			array_unique(
				array_filter(array_column($result["data"] ?? [], "id"), "frank_model"),
			),
		);
		sort($models);
		frank_json(200, ["models" => array_slice($models, 0, 500)]);
	}

	if ($route !== "chat" || $method !== "POST") {
		frank_error(404, "Unknown route.");
	}
	if (
		!is_string($data["message"] ?? null) ||
		trim($data["message"]) === "" ||
		mb_strlen($data["message"], "UTF-8") > 2500
	) {
		frank_error(400, "Message must contain 1–2500 characters.");
	}
	if (!frank_model($config["providers"][$id]["model"] ?? "")) {
		frank_error(400, "Choose and save a model first.");
	}
	if ($usage["attempts"] >= $config["dailyLimit"]) {
		frank_error(
			429,
			"Daily AI attempt cap reached. Adjust it deliberately in Settings or use scripted mode.",
		);
	}
	if (microtime(true) - ($usage["last"] ?? 0) < 1.5) {
		frank_error(429, "Give Frank a moment before the next request.");
	}
	$usage["attempts"]++;
	$usage["last"] = microtime(true);
	frank_write($private . "/usage.json", $usage);
	$payload = frank_payload($id, $data, $config);
	$result = frank_upstream($id, $key, $payload);
	$reply = "";
	if ($id === "openai") {
		foreach ($result["output"] ?? [] as $output) {
			foreach ($output["content"] ?? [] as $part) {
				if (($part["type"] ?? "") === "output_text") {
					$reply .= ($part["text"] ?? "") . "\n";
				}
			};
		}
	} elseif ($id === "anthropic") {
		foreach ($result["content"] ?? [] as $part) {
			if (($part["type"] ?? "") === "text") {
				$reply .= ($part["text"] ?? "") . "\n";
			}
		}
	} else {
		$reply = $result["choices"][0]["message"]["content"] ?? "";
	}
	if (!is_string($reply) || trim($reply) === "") {
		frank_error(
			502,
			"The model returned no readable reply. Try another model; no automatic retry was made.",
		);
	}
	$tokens = $result["usage"] ?? [];
	$usage["inputTokens"] += max(
		0,
		(int) ($tokens["input_tokens"] ?? ($tokens["prompt_tokens"] ?? 0)),
	);
	$usage["outputTokens"] += max(
		0,
		(int) ($tokens["output_tokens"] ?? ($tokens["completion_tokens"] ?? 0)),
	);
	frank_write($private . "/usage.json", $usage);
	frank_json(200, [
		"reply" => frank_text(trim($reply), 4000),
		"provider" => $id,
		"model" => $config["providers"][$id]["model"],
		"usage" => frank_usage($usage, $config),
	]);
} catch (Throwable $error) {
	$code =
		$error instanceof RuntimeException &&
		$error->getCode() >= 400 &&
		$error->getCode() <= 599
			? $error->getCode()
			: 500;
	$message =
		$code === 500
			? "The private bridge could not complete this request. Check the hosting error log and private config; no automatic retry was made."
			: $error->getMessage();
	if ($error instanceof JsonException) {
		$code = 400;
		$message = "Invalid JSON data. No request was sent.";
	}
	frank_json($code, ["error" => $message]);
} finally {
	if (is_resource($lock)) {
		flock($lock, LOCK_UN);
		fclose($lock);
	}
}
