import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',hidden:false,disabled:false,events:{},setAttribute(){},addEventListener(k,f){this.events[k]=f}});return nodes.get(id)}
let saved='';const window={FrankStorage:{read:()=>saved,write:(k,v)=>{saved=v}},FrankConnection:{ready:()=>false}};
vm.runInNewContext(fs.readFileSync(new URL('../character.js',import.meta.url),'utf8'),{window,document:{getElementById:node,addEventListener(){}},console});
assert.equal(window.FrankCharacter.get().length,0);assert.equal(window.FrankCharacter.get().opinion,0);
for(let length=0;length<3;length++)for(let humour=0;humour<3;humour++)for(let roughness=0;roughness<3;roughness++)for(let opinion=0;opinion<3;opinion++){
 for(const [k,v] of Object.entries({length,humour,roughness,opinion})){const n=node('character-'+k);n.value=String(v);n.events.input({target:n});}
 if(length===0)assert(node('character-example').textContent.trim().split(/\s+/u).length<=9);
}
node('character-reset').events.click();assert.equal(window.FrankCharacter.get().length,0);assert.equal(window.FrankCharacter.get().opinion,0);
const spec=JSON.parse(fs.readFileSync(new URL('../character-spec.json',import.meta.url),'utf8'));
assert(spec.rules.length[0].includes('maximum 9 words'));assert(spec.base.includes('Be company, not a coach'));
assert.deepEqual(JSON.parse(saved),{...spec.defaults,notes:''});
console.log('81 UI combinations passed; short examples max 9 words; reset/defaults match shared rules.');
