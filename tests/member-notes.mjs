import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const TERMS=(await fs.readFile('community-api/terms.ts','utf8')).match(/TERMS_VERSION = '([^']+)'/)[1];
// "Write to us" notes, the artist's email when a piece is hidden, and the monthly cleanup.
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'notes-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await fs.readdir('community-api/migrations')).sort())await db.exec((await fs.readFile(`community-api/migrations/${file}`,'utf8')).replace(/^--.*$/gm,'').replace(/\n/g,' '));
 await db.exec("INSERT OR IGNORE INTO community_memberships(user_id,administrator) VALUES('test-admin',1);");
 async function call(path,method='GET',body,principal=admin){
  const bytes=body===undefined?new Uint8Array():new TextEncoder().encode(JSON.stringify(body));
  const capability=await signCapability(secret,principal,method,`/api/community/${path.split('?')[0]}`,bytes);
  return mf.dispatchFetch(`http://localhost/api/community/${path}`,{method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':'application/json'},body:method==='GET'?undefined:bytes});
 }
 const artistUser={userId:'user_kenji',administrator:false};
 const {id}=await (await call('applications','PUT',{kind:'artist',payload:{name:'Kenji Sato',email:'kenji@example.com',regionId:'region-rogue-valley',city:'Ashland',practice:'Prints',portfolio:'',note:'Prints',opportunities:false,agreeTerms:true,termsVersion:TERMS}},artistUser)).json();
 await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'});

 // Write to us.
 const note=(body,principal=artistUser)=>call('notes','PUT',{topic:'problem',body:'The upload button does nothing.',...body},principal);
 assert.equal((await note({topic:'gossip'})).status,400,'a topic from the list is required');
 assert.equal((await note({body:'  '})).status,400,'a note needs words');
 assert.equal((await note({})).status,200,'an artist can write to us');
 const stored=await db.prepare('SELECT name,email,delivery_status,artist_id FROM member_notes').first();
 assert.deepEqual([stored.name,stored.email,stored.artist_id],['Kenji Sato','kenji@example.com',id],'the note carries the artist’s own name and email');
 assert.equal(stored.delivery_status,'not_configured');
 assert.equal((await note({},{userId:'user_nobody',administrator:false})).status,401,'an account with no workspace can’t send');
 for(let i=0;i<9;i++)await note({});
 assert.equal((await note({})).status,429,'ten notes a day');
 assert.equal((await call('notes','GET',undefined,artistUser)).status,403,'only the administrator reads notes');
 const notes=(await (await call('notes')).json()).notes;
 assert.equal(notes.length,10);assert.equal(notes[0].topicLabel,'Something isn’t working');
 await call('notes','PUT',{action:'handled',id:notes[0].id},artistUser);
 assert.equal((await (await call('notes')).json()).notes.length,10,'an artist can’t close notes');
 await call('notes','PUT',{action:'handled',id:notes[0].id});
 assert.equal((await (await call('notes')).json()).notes.length,9,'the administrator can');

 // Hide emails the artist and records why.
 const page=async()=>JSON.parse((await db.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).payload);
 const revision=async()=>(await db.prepare("SELECT revision FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).revision;
 const withWork={...await page(),published:true,works:[{id:'w1',title:'Heron',public:true,imageKey:'',sampleImage:'/images/community-pilot/alan-just/self-portrait.webp'}]};
 await call('record','PUT',{collection:'artists',id,payload:withWork,revision:await revision()},artistUser);
 await call('admin/new-work','PUT',{artistId:id,workId:'w1',hidden:true,reason:'not-art'});
 let work=(await page()).works[0];
 assert.equal(work.hiddenReason,'not-art','the reason is kept');
 assert.equal(work.hiddenNotice,'not_configured','the artist’s email is attempted and recorded');
 await call('record','PUT',{collection:'artists',id,payload:{...await page(),works:[{...work,hiddenReason:'',hiddenNotice:''}]},revision:await revision()},artistUser);
 assert.equal((await page()).works[0].hiddenReason,'not-art','an artist can’t erase the reason');
 const listed=(await (await call('admin/new-work')).json()).items[0];
 assert.equal(listed.hiddenReason,'not-art');
 await call('admin/new-work','PUT',{artistId:id,workId:'w1',hidden:false});
 work=(await page()).works[0];
 assert.equal(work.hiddenByAdmin,undefined);assert.equal(work.hiddenReason,undefined,'unhiding clears the reason');

 // Monthly cleanup.
 await db.exec("INSERT INTO artist_messages(id,artist_id,sender_name,sender_email,body,sender_hash,delivery_status,created_at) VALUES('old','a','V','v@example.com','hi','h','sent','2023-01-01T00:00:00Z'),('new','a','V','v@example.com','hi','h','sent',strftime('%Y-%m-%dT%H:%M:%fZ','now'));");
 await db.exec("UPDATE member_notes SET created_at='2023-01-01T00:00:00Z' WHERE id=(SELECT id FROM member_notes LIMIT 1);");
 await db.exec("INSERT INTO artwork_reports(id,artist_id,work_id,reason,sender_hash,status,created_at,closed_at) VALUES('r-old','a','w','other','h','dismissed','2024-01-01T00:00:00Z','2024-01-02T00:00:00Z'),('r-open','a','w','other','h','open','2024-01-01T00:00:00Z',NULL);");
 const worker=await mf.getWorker();
 await worker.scheduled({cron:'0 10 1 * *'});
 await new Promise(resolve=>setTimeout(resolve,300));
 assert.deepEqual((await db.prepare('SELECT id FROM artist_messages').all()).results.map(r=>r.id),['new'],'messages over two years old are deleted');
 assert.equal((await db.prepare('SELECT count(*) AS n FROM member_notes').first()).n,9,'old notes are deleted');
 assert.deepEqual((await db.prepare('SELECT id FROM artwork_reports').all()).results.map(r=>r.id),['r-open'],'reports closed over a year ago are deleted; open ones stay');
 console.log('Member notes passed: Write to us, hide emails with reasons, monthly cleanup.');
}finally{await mf.dispose()}
