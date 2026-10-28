import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createFrankServer} from '../bridge/server.mjs';
const folder=await fs.mkdtemp(path.join(os.tmpdir(),'frank-cap-'));
await fs.writeFile(path.join(folder,'usage.json'),JSON.stringify({day:new Date().toISOString().slice(0,10),attempts:55,inputTokens:0,outputTokens:0}));
const bridge=await createFrankServer({dataDir:folder,fetchImpl:async()=>Response.json({choices:[{message:{content:'Yeah. Cheers.'}}]})});
await new Promise(r=>bridge.server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+bridge.server.address().port;
try{
 let response=await fetch(base+'/api/status');const cookie=response.headers.get('set-cookie').split(';')[0];assert.equal((await response.json()).usage.dailyLimit,0);
 const post=(route,data)=>fetch(base+'/api/'+route,{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await post('settings',{provider:'groq',key:'test-key',model:'test-model'})).status,200);
 assert.equal((await post('chat',{provider:'groq',message:'Cheers'})).status,200);
 await post('settings',{provider:'groq',dailyLimit:1});await new Promise(r=>setTimeout(r,1550));
 assert.equal((await post('chat',{provider:'groq',message:'Capped'})).status,429);
 assert.equal((await post('settings',{provider:'groq',dailyLimit:0})).status,200);
 await new Promise(r=>setTimeout(r,1550));
 assert.equal((await post('chat',{provider:'groq',message:'Uncapped again'})).status,200);
 assert.equal(JSON.parse(await fs.readFile(path.join(folder,'providers.json'),'utf8')).dailyLimit,0);
 console.log('No default cap; chat beyond 50; explicit cap enforced; zero disables and persists.');
} finally {await new Promise(r=>bridge.server.close(r));await fs.rm(folder,{recursive:true,force:true});}
