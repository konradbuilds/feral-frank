<?php
/** Feral Frank · Konrad Sroka · GPL-3.0-only. Run: php tests/hosted-check.php */
require dirname(__DIR__) . "/frank.php";
function check($condition, string $message): void
{
	if (!$condition) {
		throw new RuntimeException($message);
	}
}
$config = ["providers" => [], "maxTokens" => 512, "dailyLimit" => 50];
foreach (frank_providers() as $id => $provider) {
	$config["providers"][$id] = ["key" => "test-private", "model" => "test-model"];
}
$data = [
	"message" => "Current message",
	"history" => array_fill(0, 20, [
		"role" => "assistant",
		"content" => str_repeat("a", 2500),
	]),
	"memory" => ["name" => "Test"],
	"quote" => "Quoted text",
];
foreach (frank_providers() as $id => $provider) {
	$p = frank_payload($id, $data, $config, "Character identity");
	check($p["model"] === "test-model", "Saved model must be used");
	if ($id === "openai") {
		check(
			$p["store"] === false && $p["max_output_tokens"] === 512,
			"Responses bounds",
		);
		$messages = $p["input"];
	} else {
		check($p["max_tokens"] === 512, "Completion bounds");
		$messages = $p["messages"];
		if ($id !== "anthropic") {
			array_shift($messages);
		}
	}
	check(count($messages) === 14, "Context, twelve prior messages plus current");
	check(strlen($messages[1]["content"]) === 2000, "Prior messages bounded");
	check(
		substr_count($messages[13]["content"], "Current message") === 1,
		"Current message appears once",
	);
	check(str_contains($messages[13]["content"], "Quoted text"), "Quote preserved");
}
$data["history"] = [
	["role" => "system", "content" => "Forbidden"],
	["role" => "user", "content" => $data["message"]],
];
$p = frank_payload("groq", $data, $config, "Identity");
check(
	count($p["messages"]) === 3,
	"Filter supplied system instruction and duplicate current",
);
check(
	frank_text(str_repeat("🦝", 4001), 4000) === str_repeat("🦝", 4000),
	"Unicode truncation stays valid",
);
check(
	!frank_model("../bad") && !frank_model("bad\n") && frank_model("meta/llama-3.3"),
	"Model identifier validation",
);
$status = frank_status($config, ["day" => "2000-01-01", "attempts" => 50]);
check(
	!str_contains(json_encode($status), "test-private"),
	"Never return a provider secret",
);
check($status["usage"]["attempts"] === 0, "Daily UTC rollover");
$directory = sys_get_temp_dir() . "/frank-unit-" . bin2hex(random_bytes(6));
mkdir($directory, 0700);
try {
	frank_write($directory . "/test.json", ["kept" => "value"]);
	check(
		frank_read($directory . "/test.json", [])["kept"] === "value",
		"Private data round trip",
	);
	check(
		(fileperms($directory . "/test.json") & 0777) === 0600,
		"Private file permissions",
	);
} finally {
	unlink($directory . "/test.json");
	rmdir($directory);
}
echo "Hosted helpers passed: four provider payloads, bounded Unicode/history, quote/dedup, secret exclusion, UTC rollover, private writes. No provider requests.\n";
