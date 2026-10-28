import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createFrankServer } from '../bridge/server.mjs';
const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'frank-test-'));
let captures = [],
	mode = 'ok';
async function mock(url, init) {
	captures.push({
		url,
		...init,
		body: init.body ? JSON.parse(init.body) : undefined,
	});
	if (url.endsWith('/models') || url.endsWith('/api/tags'))
		return Response.json(
			url.endsWith('/api/tags')
				? { models: [{ name: 'test-model' }] }
				: { data: [{ id: 'test-model' }] }
		);
	if (mode === 'auth')
		return Response.json(
			{ error: { message: 'secret-upstream-detail' } },
			{ status: 401 }
		);
	if (url.includes('openai.com'))
		return Response.json({
			output: [
				{ content: [{ type: 'output_text', text: 'Hello from GPT.' }] },
			],
			usage: { input_tokens: 11, output_tokens: 5 },
		});
	if (url.includes('anthropic.com'))
		return Response.json({
			content: [{ type: 'text', text: 'Hello from Claude.' }],
			usage: { input_tokens: 12, output_tokens: 6 },
		});
	return Response.json({
		choices: [{ message: { content: 'Hello from chat completions.' } }],
		usage: { prompt_tokens: 13, completion_tokens: 7 },
	});
}
let bridge = await createFrankServer({ dataDir: folder, fetchImpl: mock });
await new Promise((r) => bridge.server.listen(0, '127.0.0.1', r));
let base = 'http://127.0.0.1:' + bridge.server.address().port;
let r = await fetch(base + '/api/status');
let cookie = r.headers.get('set-cookie').split(';')[0];
const post = (route, body, headers = {}) =>
	fetch(base + '/api/' + route, {
		method: 'POST',
		headers: {
			Origin: base,
			'Content-Type': 'application/json',
			Cookie: cookie,
			...headers,
		},
		body: JSON.stringify(body),
	});
assert.equal(
	(
		await post(
			'settings',
			{ provider: 'openai', key: 'fake-openai', model: 'test-model' },
			{ Origin: 'https://evil.example' }
		)
	).status,
	403
);
assert.equal((await post('settings', null)).status, 400);
assert.equal(
	(await post('settings', { provider: '__proto__', key: 'x' })).status,
	400
);
for (const id of ['openai', 'anthropic', 'nvidia', 'ollama', 'groq']) {
	r = await post('settings', {
		provider: id,
		key: 'fake-' + id,
		model: 'test-model',
		dailyLimit: 10,
		maxTokens: 256,
	});
	assert.equal(r.status, 200);
	assert.ok(!(await r.text()).includes('fake-'));
	r = await fetch(base + '/api/models?provider=' + id);
	assert.deepEqual((await r.json()).models, ['test-model']);
	await new Promise((r) => setTimeout(r, 1550));
	r = await post('chat', {
		provider: id,
		message: 'hello',
		history: [{ role: 'assistant', content: 'Earlier' }],
		memory: { profile: { name: 'Tester' } },
		quote: 'A saved quote',
	});
	let data = await r.json();
	assert.equal(r.status, 200, JSON.stringify(data));
	assert.ok(data.reply.includes('Hello'));
	const c = captures.at(-1);
	assert.ok(c.body.model === 'test-model');
	assert.ok(c.body.max_tokens === 256 || c.body.max_output_tokens === 256);
	if (id === 'openai') assert.equal(c.body.store, false);
	if (id === 'anthropic')
		assert.equal(c.headers['anthropic-version'], '2023-06-01');
}
r = await post('chat', { provider: 'openai', message: 'too soon' });
assert.equal(r.status, 429);
const invalid = await post('settings', {
	provider: 'openai',
	key: 'changed',
	dailyLimit: 0,
});
assert.equal(invalid.status, 400);
r = await fetch(base + '/api/status');
assert.equal((await r.json()).usage.dailyLimit, 10);
assert.equal(
	(await fs.stat(path.join(folder, 'providers.json'))).mode & 0o777,
	0o600
);
const cfg = JSON.parse(
	await fs.readFile(path.join(folder, 'providers.json'), 'utf8')
);
assert.equal(cfg.providers.openai.key, 'fake-openai');
for (const file of [
	'bridge/server.mjs',
	'.config/providers.json',
	'providers.json',
])
	assert.equal((await fetch(base + '/' + file)).status, 404);
mode = 'auth';
await new Promise((r) => setTimeout(r, 1550));
r = await post('chat', { provider: 'openai', message: 'trigger error' });
const err = await r.text();
assert.equal(r.status, 401);
assert.ok(!err.includes('secret-upstream-detail'));
await post('settings', { provider: 'openai', dailyLimit: 6 });
await new Promise((r) => setTimeout(r, 1550));
r = await post('chat', { provider: 'openai', message: 'over daily cap' });
assert.equal(r.status, 429);
assert.match((await r.json()).error, /daily attempt cap/);
await new Promise((r) => bridge.server.close(r));
bridge = await createFrankServer({ dataDir: folder, fetchImpl: mock });
await new Promise((r) => bridge.server.listen(0, '127.0.0.1', r));
base = 'http://127.0.0.1:' + bridge.server.address().port;
r = await fetch(base + '/api/status');
const restored = await r.json();
assert.equal(restored.usage.attempts, 6);
assert.equal(
	restored.providers.find((p) => p.id === 'openai').model,
	'test-model'
);
assert.match(await (await fetch(base + '/')).text(), /frank-bridge/);
await new Promise((r) => bridge.server.close(r));
await fs.rm(folder, { recursive: true, force: true });
console.log(
	'Bridge passed: five providers, model lists, saved keys/models, private permissions, CSRF, invalid input rollback, static isolation, rate/daily caps, explicit auth failure, persisted usage. All upstream calls mocked.'
);
