import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
// Applying opens a private page right away; nothing is public until approval; a decline closes it.
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'intake-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await fs.readdir('community-api/migrations')).sort())await db.exec((await fs.readFile(`community-api/migrations/${file}`,'utf8')).replace(/^--.*$/gm,'').replace(/\n/g,' '));
 await db.exec("INSERT OR IGNORE INTO community_memberships(user_id,administrator) VALUES('test-admin',1);");
 async function call(path,method='GET',body,principal=admin){
  const bytes=body===undefined?new Uint8Array():new TextEncoder().encode(JSON.stringify(body));
  const capability=await signCapability(secret,principal,method,`/api/community/${path}`,bytes);
  return mf.dispatchFetch(`http://localhost/api/community/${path}`,{method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':'application/json'},body:method==='GET'?undefined:bytes});
 }
 const publicState=async()=>(await (await mf.dispatchFetch('http://localhost/api/community/public/state')).json()).records;
 const membership=async user=>(await db.prepare('SELECT artist_id FROM community_memberships WHERE user_id=?1').bind(user).first())?.artist_id??null;
 const application=(name)=>({kind:'artist',payload:{name,email:`${name.split(' ')[0].toLowerCase()}@example.com`,regionId:'region-rogue-valley',city:'Ashland',practice:'Painting',portfolio:'',note:'Paintings at the library through May.',opportunities:false}});

 const applicant={userId:'user_applicant',administrator:false};
 const sent=await call('applications','PUT',application('Rae Adams'),applicant);
 assert.equal(sent.status,200,'an artist can apply');
 const {id}=await sent.json();
 assert.equal(await membership('user_applicant'),id,'applying opens the applicant’s workspace');
 const artist=await db.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1").bind(id).first();
 assert.equal(JSON.parse(artist.payload).published,false,'the new page starts unpublished');
 assert.equal((await call('applications','PUT',application('Rae Adams'),applicant)).status,409,'one artist workspace per account');

 // Even a page marked published and a published showing stay out of public data before approval.
 const page={...JSON.parse(artist.payload),published:true,works:[]};
 assert.equal((await call('record','PUT',{collection:'artists',id,payload:page,revision:1},applicant)).status,200,'the applicant can edit their own page');
 const show={id:'show-rae',artistId:id,venueId:'new-show-rae',venue:'FPO café',address:'1 Main St',city:'Ashland',website:'',start:'2026-09-01',end:'2026-12-01',artworkIds:[],featuredArtworkId:'',status:'published'};
 assert.equal((await call('record','PUT',{collection:'showings',id:'show-rae',payload:show,revision:0},applicant)).status,200,'the applicant can save a showing');
 assert.ok(!(await publicState()).some(record=>record.id===id||record.id==='show-rae'),'nothing is public before approval');

 assert.equal((await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'})).status,200,'an administrator can approve');
 const approved=await db.prepare("SELECT payload FROM community_records WHERE collection='applications' AND id=?1").bind(id).first();
 assert.equal(JSON.parse(approved.payload).invitationAccepted,true,'approval needs no acceptance step');
 assert.ok((await publicState()).some(record=>record.collection==='artists'&&record.id===id),'an approved, published page is public');

 const second={userId:'user_second',administrator:false};
 const secondId=(await (await call('applications','PUT',application('Luis Moreno'),second)).json()).id;
 assert.equal(await membership('user_second'),secondId);
 assert.equal((await call('applications','PUT',{action:'review',kind:'artist',id:secondId,status:'declined'})).status,200);
 assert.equal(await membership('user_second'),null,'a decline closes the private workspace');
 console.log('Artist intake passed: private page on apply, nothing public before approval, no acceptance step, decline closes the workspace.');
}finally{await mf.dispose()}
