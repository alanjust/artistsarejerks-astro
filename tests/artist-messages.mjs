import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const TERMS=(await fs.readFile('community-api/terms.ts','utf8')).match(/TERMS_VERSION = '([^']+)'/)[1];
// Visitors can message an artist who turned on the form; bots and floods are turned away;
// only the artist can read or delete their own messages.
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'messages-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await fs.readdir('community-api/migrations')).sort())await db.exec((await fs.readFile(`community-api/migrations/${file}`,'utf8')).replace(/^--.*$/gm,'').replace(/\n/g,' '));
 await db.exec("INSERT OR IGNORE INTO community_memberships(user_id,administrator) VALUES('test-admin',1);");
 async function call(path,method='GET',body,principal=admin){
  const bytes=body===undefined?new Uint8Array():new TextEncoder().encode(JSON.stringify(body));
  const capability=await signCapability(secret,principal,method,`/api/community/${path.split("?")[0]}`,bytes);
  return mf.dispatchFetch(`http://localhost/api/community/${path}`,{method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':'application/json'},body:method==='GET'?undefined:bytes});
 }
 const send=(body,client='203.0.113.7')=>mf.dispatchFetch('http://localhost/api/community/public/messages',{method:'POST',headers:{'x-aaj-prototype':'local','Content-Type':'application/json','x-aaj-client':client},body:JSON.stringify({name:'Visitor',email:'visitor@example.com',message:'Is the portrait for sale?',website:'',elapsed:9000,...body})});
 const count=async()=>(await db.prepare('SELECT count(*) AS n FROM artist_messages').first()).n;

 // An approved, published artist.
 const artistUser={userId:'user_artist',administrator:false};
 const {id}=await (await call('applications','PUT',{kind:'artist',payload:{name:'Rae Adams',email:'rae@example.com',regionId:'region-rogue-valley',city:'Ashland',practice:'Painting',portfolio:'',note:'Studio',opportunities:false,agreeTerms:true,termsVersion:TERMS}},artistUser)).json();
 await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'});
 const record=async()=>JSON.parse((await db.prepare("SELECT payload,revision FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).payload);
 const revision=async()=>(await db.prepare("SELECT revision FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).revision;
 const setForm=async on=>assert.equal((await call('record','PUT',{collection:'artists',id,payload:{...await record(),published:true,publicForm:on},revision:await revision()},artistUser)).status,200);

 await setForm(false);
 assert.equal((await send({artistId:id})).status,404,'no form, no messages');
 await setForm(true);
 const public_=(await (await mf.dispatchFetch('http://localhost/api/community/public/state')).json()).records.find(r=>r.collection==='artists'&&r.id===id).payload;
 assert.equal(public_.publicForm,true,'the public page knows the form is on');
 assert.equal(public_.email,'','the artist’s email stays private');

 assert.equal((await send({artistId:id})).status,200,'a visitor can send a message');
 assert.equal(await count(),1);
 assert.equal((await send({artistId:id,website:'http://spam.example'})).status,200,'the hidden field quietly drops bots');
 assert.equal((await send({artistId:id,elapsed:500})).status,200,'an instant submit is quietly dropped');
 assert.equal(await count(),1,'dropped messages are not stored');
 assert.equal((await send({artistId:id,email:'not-an-email'})).status,400,'a working email is required');
 for(let i=0;i<4;i++)assert.equal((await send({artistId:id})).status,200);
 assert.equal((await send({artistId:id})).status,429,'five messages an hour from one sender');
 assert.equal((await send({artistId:id},'198.51.100.9')).status,200,'a different sender is not blocked');

 const inbox=await (await call('messages','GET',undefined,artistUser)).json();
 assert.equal(inbox.messages.length,6,'the artist sees their messages');
 assert.equal(inbox.messages[0].delivery_status,'not_configured','delivery status is recorded');
 const stranger={userId:'user_stranger',administrator:false};
 await db.exec("INSERT INTO community_memberships(user_id,artist_id) VALUES('user_stranger','someone-else');");
 assert.equal((await (await call('messages','GET',undefined,stranger)).json()).messages.length,0,'another artist sees none of them');
 const first=inbox.messages[0].id;
 assert.equal((await (await call(`messages?artist=${id}`,'GET',undefined,admin)).json()).messages.length,6,'an administrator viewing the workspace sees the artist’s messages');
 await call(`messages?artist=${id}`,'PUT',{action:'read',id:first},admin);
 assert.equal((await db.prepare('SELECT read_at FROM artist_messages WHERE id=?1').bind(first).first()).read_at,null,'an administrator’s look does not mark it read');
 assert.equal((await (await call(`messages?artist=${id}`,'GET',undefined,stranger)).json()).messages.length,0,'a non-administrator cannot ask for someone else’s messages');
 await call('messages','PUT',{action:'delete',id:first},stranger);
 assert.equal(await count(),6,'another artist cannot delete them');
 await call('messages','PUT',{action:'read',id:first},artistUser);
 assert.ok((await db.prepare('SELECT read_at FROM artist_messages WHERE id=?1').bind(first).first()).read_at,'marking read works');
 await call('messages','PUT',{action:'delete',id:first},artistUser);
 assert.equal(await count(),5,'the artist can delete a message');
 console.log('Artist messages passed: form opt-in, private email, bot traps, rate limits, owner-only inbox.');
}finally{await mf.dispose()}
