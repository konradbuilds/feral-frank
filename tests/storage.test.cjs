const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const values = new Map();
let rejectChat = false;
const localStorage = {
	get length() {
		return values.size;
	},
	key(i) {
		return [...values.keys()][i] ?? null;
	},
	getItem(k) {
		return values.has(k) ? values.get(k) : null;
	},
	setItem(k, v) {
		if (rejectChat && k === 'feral-frank-v1')
			throw new DOMException('Quota', 'QuotaExceededError');
		values.set(k, String(v));
	},
	removeItem(k) {
		values.delete(k);
	},
};
const context = {
	window: {},
	localStorage,
	DOMException,
	CustomEvent: class {
		constructor(type, options) {
			this.type = type;
			this.detail = options.detail;
		}
	},
	document: { dispatchEvent() {} },
};
vm.createContext(context);
vm.runInContext(
	fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf8'),
	context
);
const storage = context.window.FrankStorage;
assert.equal(storage.profile().id, 'medium');
assert.equal(storage.profile().messages, 200);
localStorage.setItem('other-app', 'unrelated');
localStorage.setItem('feral-frank-memory-v1', '{"name":"Keep me"}');
localStorage.setItem('feral-frank-scratch-v1', '["Keep this too"]');
const state = {
	log: Array.from({ length: 1000 }, (_, i) => ({
		id: String(i),
		role: i % 2 ? 'assistant' : 'user',
		content: 'x'.repeat(1000),
	})),
};
let plan = storage.planChat(state, 'extra');
assert.equal(plan.removed, 0);
storage.commitProfile(plan);
assert.equal(storage.profile().id, 'extra');
plan = storage.planChat(state, 'low');
assert.equal(plan.removed, 960);
assert.equal(plan.state.log[0].id, '960');
storage.commitProfile(plan);
assert.equal(storage.profile().id, 'low');
assert.equal(JSON.parse(localStorage.getItem('feral-frank-v1')).log.length, 40);
assert.equal(
	localStorage.getItem('feral-frank-memory-v1'),
	'{"name":"Keep me"}'
);
assert.equal(localStorage.getItem('other-app'), 'unrelated');
assert.throws(
	() => storage.write('feral-frank-memory-v1', 'z'.repeat(150000)),
	/limit/
);
assert.equal(
	localStorage.getItem('feral-frank-memory-v1'),
	'{"name":"Keep me"}'
);
assert.ok(storage.status().failed);
storage.write('feral-frank-memory-v1', '{"name":"Keep me"}');
assert.ok(!storage.status().failed);
const beforeChat = localStorage.getItem('feral-frank-v1'),
	beforePolicy = localStorage.getItem('feral-frank-storage-v1');
rejectChat = true;
assert.throws(() => storage.commitProfile(storage.planChat(state, 'high')));
assert.equal(localStorage.getItem('feral-frank-v1'), beforeChat);
assert.equal(localStorage.getItem('feral-frank-storage-v1'), beforePolicy);
rejectChat = false;
localStorage.setItem('feral-frank-memory-v1', 'z'.repeat(150000));
plan = storage.planChat(state, 'low');
assert.equal(plan.fits, false);
assert.throws(() => storage.commitProfile(plan));
assert.equal(localStorage.getItem('feral-frank-memory-v1').length, 150000);
console.log(
	'Storage passed: default/profile bounds, exact trim preview, protected facts/notes, unrelated data isolation, rejected writes, failure recovery and native quota rollback.'
);
