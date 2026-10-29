import assert from 'node:assert/strict';
import { characterPrompt } from '../bridge/character.mjs';
for (const energy of [0, 1, 29.99]) assert(characterPrompt({energy}).includes('Energy: low'));
for (const energy of [30, 50, 70, undefined, null, '10', -1, 101, NaN, Infinity]) assert(characterPrompt({energy}).includes('Energy: steady'));
for (const energy of [70.01, 99, 100]) assert(characterPrompt({energy}).includes('Energy: high'));
assert(characterPrompt({energy:1}).includes('still answer actual requests completely'));
console.log('Energy boundaries, invalid input fallback and answer-first exception passed.');
for (const thankfulness of [0, 29.99]) assert(characterPrompt({thankfulness}).includes('Thankfulness: low'));
for (const thankfulness of [30, 70, null, '20', -1, 101, NaN]) assert(characterPrompt({thankfulness}).includes('Thankfulness: steady'));
for (const thankfulness of [70.01, 100]) assert(characterPrompt({thankfulness}).includes('Thankfulness: high'));
for (const energy of [10,50,90]) for (const thankfulness of [10,50,90]) {
 const prompt=characterPrompt({energy,thankfulness});
 assert(prompt.includes('Energy: '+(energy<30?'low':energy>70?'high':'steady')));
 assert(prompt.includes('Thankfulness: '+(thankfulness<30?'low':thankfulness>70?'high':'steady')));
}
assert(characterPrompt({energy:10,thankfulness:90}).includes('overrides low-energy irritation'));
console.log('Thankfulness boundaries and all nine energy/thankfulness combinations passed.');
