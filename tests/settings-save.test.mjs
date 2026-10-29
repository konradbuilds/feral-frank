import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../connection.js', import.meta.url), 'utf8');
const start = source.indexOf('\t\t$("ai-save-limits").addEventListener');
const end = source.indexOf('\t\t$("ai-save").addEventListener', start);
const nodes = new Map();
let click;
const $ = id => {
 if (!nodes.has(id)) nodes.set(id, {value: id === 'ai-token-limit' ? '256' : '0', addEventListener: (_, handler) => {click = handler;}});
 return nodes.get(id);
};
const calls = [];
const context = vm.createContext({$, requesting:false,saving:false,selected:'groq',state:null,
 api:async (route, data) => {calls.push({route,data});return {};}, renderUsage(){},emit(){}});
vm.runInContext(source.slice(start,end),context);
await click();
assert.equal(calls.length,1);
assert.equal(calls[0].route,'settings');
assert.deepEqual(JSON.parse(JSON.stringify(calls[0].data)),{provider:'groq',dailyLimit:0,maxTokens:256});
assert.equal(context.saving,false);
assert.equal($('ai-save-limits').disabled,false);
context.api=async()=>{throw Error('Save failed');};
await click();
assert.equal($('ai-limits-status').textContent,'Save failed');
assert.equal(context.saving,false);
console.log('Save settings sends limits only; no key/model/check; failure releases UI.');
