import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const TERMS=(await fs.readFile('community-api/terms.ts','utf8')).match(/TERMS_VERSION = '([^']+)'/)[1];
// Studios open by appointment: a kind of showing with the whole portfolio, the artist's
// own contacts, and a street address only when the artist chooses to show it.
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'studio-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
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
 const listed=async id=>(await (await mf.dispatchFetch('http://localhost/api/community/public/state')).json()).records.find(r=>r.collection==='showings'&&r.id===id)?.payload;
 const artistUser={userId:'user_kim',administrator:false};
 const {id}=await (await call('applications','PUT',{kind:'artist',payload:{name:'Kim Lee',email:'kim@example.com',regionId:'region-rogue-valley',city:'Medford',practice:'Painting',portfolio:'',note:'Studio',opportunities:false,agreeTerms:true,termsVersion:TERMS}},artistUser)).json();
 await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'});
 const page=JSON.parse((await db.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).payload);
 const sample='/images/community-pilot/alan-just/self-portrait.webp';
 await call('record','PUT',{collection:'artists',id,payload:{...page,published:true,works:[{id:'w1',title:'One',public:true,imageKey:'',sampleImage:sample},{id:'w2',title:'Two',public:false,imageKey:'',sampleImage:sample},{id:'w3',title:'Three',public:true,imageKey:'',sampleImage:sample}]},revision:(await db.prepare("SELECT revision FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).revision},artistUser);
 const studio={id:'studio-kim',artistId:id,kind:'studio',venueId:'studio-kim',venue:'Kim Lee’s studio',address:'44 Oak St',city:'Medford',website:'',regionId:'region-rogue-valley',start:today,end:'',ongoing:true,confirmedAt:today,showAddress:false,contactPhone:'541-555-0100',contactEmail:'',bookingUrl:'',artworkIds:[],featuredArtworkId:'',status:'published'};
 const save=async(payload,revision)=>call('record','PUT',{collection:'showings',id:'studio-kim',payload,revision},artistUser);
 assert.equal((await save(studio,0)).status,200);
 let shown=await listed('studio-kim');
 assert.ok(shown,'a studio with a contact is listed');
 assert.equal(shown.kind,'studio');
 assert.equal(shown.address,'','the street address stays private by default');
 assert.equal(shown.city,'Medford');
 assert.deepEqual(shown.artworkIds,['w1','w3'],'the whole public portfolio, nothing private');
 assert.equal(shown.featuredArtworkId,'w1','the first piece is the card image');
 assert.equal(shown.contactPhone,'541-555-0100');
 await save({...studio,showAddress:true},1);
 assert.equal((await listed('studio-kim')).address,'44 Oak St','shown when the artist chooses');
 await save({...studio,contactPhone:'',bookingUrl:'javascript:alert(1)'},2);
 assert.equal(await listed('studio-kim'),undefined,'no usable contact, no listing (and unsafe links are dropped)');
 await save({...studio,contactPhone:'',bookingUrl:'https://cal.example.com/kim'},3);
 assert.equal((await listed('studio-kim')).bookingUrl,'https://cal.example.com/kim','a booking link counts');
 await save({...studio,confirmedAt:ago(80),start:ago(200)},4);
 assert.equal(await listed('studio-kim'),undefined,'a studio not checked in for 74 days leaves the listings');
 await save({...studio,confirmedAt:ago(61),start:ago(200)},5);
 const worker=await mf.getWorker();await worker.scheduled({cron:'0 16 * * *'});await new Promise(resolve=>setTimeout(resolve,300));
 assert.equal((await db.prepare("SELECT stage FROM showing_reminders WHERE showing_id='studio-kim'").first())?.stage,1,'studios get the 60-day reminder too');
 const token=(await db.prepare("SELECT token FROM showing_reminders WHERE showing_id='studio-kim'").first()).token;
 const info=await (await mf.dispatchFetch('http://localhost/api/community/public/still-up',{method:'POST',headers:{'x-aaj-prototype':'local','Content-Type':'application/json'},body:JSON.stringify({token})})).json();
 assert.equal(info.kind,'studio','the answer page knows it’s a studio');
 assert.ok(await db.prepare("SELECT showing_id FROM showing_notices WHERE showing_id='studio-kim'").first(),'followers are told once when the studio is first listed');
 console.log('Studio passed: private address by default, whole portfolio, contacts required, check-ins and reminders, follower notice.');
}finally{await mf.dispose()}
