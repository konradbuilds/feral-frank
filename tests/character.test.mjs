import assert from 'node:assert/strict';
import {characterPrompt,characterContext} from '../bridge/character.mjs';
const defaults=characterPrompt(null);
for(const value of [[],{}, {length:-1,humour:99,roughness:'2',opinion:2.5}]) assert.equal(characterPrompt(value),defaults);
for(let n=0;n<3;n++){
 const prompt=characterPrompt({length:n,humour:n,roughness:n,opinion:n,notes:'UNTRUSTED_NOTE'});
 assert(prompt.includes('For consequential decisions'));
 assert(prompt.includes('greater opinion does not mean greater certainty'));
 assert(!prompt.includes('UNTRUSTED_NOTE'));
}
assert(characterPrompt({opinion:2}).includes('Opinionated: high'));
assert(characterPrompt({roughness:0}).includes('No swearing'));
const context=JSON.parse(characterContext({notes:'x'.repeat(900)},{note:'y'.repeat(9000)}).split('\n').slice(1).join('\n'));
assert.equal(context.styleNotes.length,600);assert.equal(context.memory.length,6000);
console.log('Character defaults, enum validation, decision rules and context separation passed.');
