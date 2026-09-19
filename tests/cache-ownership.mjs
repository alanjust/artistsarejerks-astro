import {build} from 'esbuild';
import assert from 'node:assert/strict';
const compiled=await build({entryPoints:['src/lib/community-storage.ts'],bundle:true,write:false,format:'esm',platform:'browser',target:'es2022',define:{'import.meta.env.MODE':'"development"'}});
const keys=['location','localStorage','document','window','fetch'];
const saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
const values=new Map([
 ['aaj-shared-cache-owner','previous-person'],
 ['aaj-member-artists-prototype',JSON.stringify([{id:'private-other',bio:'Other person’s private work'}])],
 ['aaj-shared-storage-pending',JSON.stringify([{collection:'artists',id:'private-other',payload:{id:'private-other'},revision:1}])]
]);
const fakeNode=()=>({dataset:{},style:{},setAttribute(){},replaceChildren(){},append(){}});
let writes=0;
try{
 globalThis.location={hostname:'127.0.0.1',pathname:'/prototype/workspace/member/',search:'?artist=mine'};
 globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key),key:index=>[...values.keys()][index]??null,get length(){return values.size}};
 globalThis.document={querySelector:()=>fakeNode(),createElement:fakeNode,createTextNode:text=>text,body:{prepend(){}}};
 globalThis.window={addEventListener(){}};
 globalThis.fetch=async (_url,options)=>{if(options.method==='PUT')writes++;return Response.json({userId:'new-person',administrator:false,records:[{collection:'artists',id:'mine',payload:{id:'mine',name:'My profile'},revision:1}]})};
 const module=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text+'\n// account switch').toString('base64'));
 assert.equal(writes,0,'old pending writes must never be replayed by the new account');
 assert.equal(values.get('aaj-shared-storage-pending'),undefined);
 assert.equal(module.getStoredItem('aaj-member-artists-prototype'),JSON.stringify([{id:'mine',name:'My profile'}]));
 const backup=[...values.entries()].find(([key])=>key.startsWith('aaj-account-backup-previous-person-'));
 assert.ok(backup&&backup[1].includes('private-other'),'previous records and edits must remain backed up');
 globalThis.fetch=async()=>Response.json({error:'Unavailable'},{status:503});
 const unavailable=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text+'\n// unavailable storage').toString('base64'));
 assert.equal(unavailable.getStoredItem('aaj-member-artists-prototype'),null,'an unverified cache must not appear in a workspace');
 assert.ok(values.get('aaj-member-artists-prototype').includes('My profile'),'failed loading must preserve the cached records');
 console.log('Account cache checks passed: no cross-account replay, preserved backups, and blocked unverified cache.');
}finally{for(const key of keys){const descriptor=saved.get(key);if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}}
