import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const TERMS=(await fs.readFile('community-api/terms.ts','utf8')).match(/TERMS_VERSION = '([^']+)'/)[1];
// Emailed "Still up?" reminders for ongoing showings, and the one-button answer page.
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'still-up-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await fs.readdir('community-api/migrations')).sort())await db.exec((await fs.readFile(`community-api/migrations/${file}`,'utf8')).replace(/^--.*$/gm,'').replace(/\n/g,' '));
 await db.exec("INSERT OR IGNORE INTO community_memberships(user_id,administrator) VALUES('test-admin',1);");
 async function call(path,method='GET',body,principal=admin){
  const bytes=body===undefined?new Uint8Array():new TextEncoder().encode(JSON.stringify(body));
  const capability=await signCapability(secret,principal,method,`/api/community/${path.split('?')[0]}`,bytes);
  return mf.dispatchFetch(`http://localhost/api/community/${path}`,{method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':'application/json'},body:method==='GET'?undefined:bytes});
 }
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});
 const ago=days=>new Date(Date.parse(`${today}T12:00:00Z`)-days*86400000).toISOString().slice(0,10);
 const worker=await mf.getWorker();
 const runDaily=async()=>{await worker.scheduled({cron:'0 16 * * *'});await new Promise(resolve=>setTimeout(resolve,300))};
 const reminders=async id=>(await db.prepare('SELECT token,cycle,stage,delivery_status,answer FROM showing_reminders WHERE showing_id=?1 ORDER BY stage').bind(id).all()).results;
 const showRecord=async id=>JSON.parse((await db.prepare("SELECT payload FROM community_records WHERE collection='showings' AND id=?1").bind(id).first()).payload);
 const answer=body=>mf.dispatchFetch('http://localhost/api/community/public/still-up',{method:'POST',headers:{'x-aaj-prototype':'local','Content-Type':'application/json'},body:JSON.stringify(body)});

 const artistUser={userId:'user_sam',administrator:false};
 const {id}=await (await call('applications','PUT',{kind:'artist',payload:{name:'Sam Ortiz',email:'sam@example.com',regionId:'region-rogue-valley',city:'Ashland',practice:'Painting',portfolio:'',note:'Studio',opportunities:false,agreeTerms:true,termsVersion:TERMS}},artistUser)).json();
 const show=(showId,confirmedAt,extra={})=>call('record','PUT',{collection:'showings',id:showId,payload:{id:showId,artistId:id,venueId:`new-${showId}`,venue:`Café ${showId}`,address:'1 Main St',city:'Ashland',website:'',start:ago(200),end:'',ongoing:true,confirmedAt,artworkIds:['w1'],featuredArtworkId:'w1',status:'published',...extra},revision:0},artistUser);
 await show('pending-artist',ago(61));
 await runDaily();
 assert.equal((await reminders('pending-artist')).length,0,'artists still waiting for approval get no reminders');
 await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'});

 await show('due',ago(61));
 await show('fresh',ago(20));
 await show('lapsed',ago(80));
 await show('draft',ago(61),{status:'draft'});
 await show('dated',ago(61),{ongoing:false,end:ago(-30)});
 await runDaily();
 let due=await reminders('due');
 assert.equal(due.length,1,'a showing 60 days past its check-in gets a reminder');
 assert.equal(due[0].stage,1);assert.equal(due[0].delivery_status,'not_configured','delivery is recorded');
 for(const other of ['fresh','lapsed','draft','dated'])assert.equal((await reminders(other)).length,0,`no reminder for ${other}`);
 await runDaily();
 assert.equal((await reminders('due')).length,1,'one reminder per stage, not one a day');

 // The last call at 70 days.
 await show('late',ago(71));
 await runDaily();
 assert.deepEqual((await reminders('late')).map(r=>r.stage),[2],'at 70 days, the last call');

 // The answer page.
 const token=due[0].token;
 assert.equal((await answer({token:'nope'})).status,400);
 const info=await (await answer({token})).json();
 assert.equal(info.venue,'Café due');assert.equal(info.settled,false,'opening the page changes nothing');
 assert.equal((await showRecord('due')).confirmedAt,ago(61));
 assert.equal((await answer({token,answer:'maybe'})).status,400);
 const yes=await (await answer({token,answer:'yes'})).json();
 assert.equal(yes.answer,'yes');
 assert.equal((await showRecord('due')).confirmedAt,today,'yes checks the showing in for today');
 assert.equal((await (await answer({token,answer:'down'})).json()).settled,true,'a used link can’t change the answer');
 assert.equal((await showRecord('due')).ongoing,true);

 const late=(await reminders('late'))[0].token;
 await answer({token:late,answer:'down'});
 const ended=await showRecord('late');
 assert.equal(ended.ongoing,false,'it came down: no longer ongoing');
 assert.equal(ended.end,ago(1),'and it ended yesterday');

 // Confirming in the workspace settles an emailed link too.
 await show('workspace',ago(62));
 await runDaily();
 const wsToken=(await reminders('workspace'))[0].token;
 const current=await showRecord('workspace');
 await call('record','PUT',{collection:'showings',id:'workspace',payload:{...current,confirmedAt:today},revision:1},artistUser);
 assert.equal((await (await answer({token:wsToken})).json()).settled,true,'a check-in in the workspace makes the email link moot');

 // The monthly cleanup still runs on its own schedule.
 await worker.scheduled({cron:'0 10 1 * *'});
 console.log('Still up passed: reminders at 60 and 70 days, once each, approved artists only, one-button answers, workspace check-ins honored.');
}finally{await mf.dispose()}
