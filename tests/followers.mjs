import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const TERMS=(await fs.readFile('community-api/terms.ts','utf8')).match(/TERMS_VERSION = '([^']+)'/)[1];
// Following an artist takes two steps, a published showing notifies confirmed
// followers once, and unsubscribing stops it.
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'followers-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await fs.readdir('community-api/migrations')).sort())await db.exec((await fs.readFile(`community-api/migrations/${file}`,'utf8')).replace(/^--.*$/gm,'').replace(/\n/g,' '));
 await db.exec("INSERT OR IGNORE INTO community_memberships(user_id,administrator) VALUES('test-admin',1);");
 async function call(path,method='GET',body,principal=admin){
  const bytes=body===undefined?new Uint8Array():new TextEncoder().encode(JSON.stringify(body));
  const capability=await signCapability(secret,principal,method,`/api/community/${path.split('?')[0]}`,bytes);
  return mf.dispatchFetch(`http://localhost/api/community/${path}`,{method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':'application/json'},body:method==='GET'?undefined:bytes});
 }
 const post=(path,body,client='203.0.113.7')=>mf.dispatchFetch(`http://localhost/api/community/public/${path}`,{method:'POST',headers:{'x-aaj-prototype':'local','Content-Type':'application/json','x-aaj-client':client},body:JSON.stringify(body)});
 const follower=email=>db.prepare('SELECT status,token FROM artist_followers WHERE email=?1').bind(email).first();

 const artistUser={userId:'user_artist',administrator:false};
 const {id}=await (await call('applications','PUT',{kind:'artist',payload:{name:'Rae Adams',email:'rae@example.com',regionId:'region-rogue-valley',city:'Ashland',practice:'Painting',portfolio:'',note:'Studio',opportunities:false,agreeTerms:true,termsVersion:TERMS}},artistUser)).json();
 await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'});
 const page=JSON.parse((await db.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).payload);
 const sample='/images/community-pilot/alan-just/self-portrait.webp';
 await call('record','PUT',{collection:'artists',id,payload:{...page,published:true,works:[{id:'w1',title:'Piece',public:true,imageKey:'',sampleImage:sample}]},revision:1},artistUser);

 assert.equal((await post('follow',{artistId:id,email:'Fan@Example.com',website:'',elapsed:9000})).status,200,'a visitor can ask for updates');
 assert.equal((await follower('fan@example.com')).status,'pending','the sign-up starts unconfirmed');
 assert.equal((await post('follow',{artistId:id,email:'bot@example.com',website:'http://spam.example',elapsed:9000})).status,200);
 assert.equal(await follower('bot@example.com'),null,'the hidden field drops bots');

 const show={id:'show-1',artistId:id,venueId:'new-1',venue:'Rogue Roasters',address:'12 Main St',city:'Ashland',website:'',start:'2026-01-01',end:'2036-01-01',artworkIds:['w1'],featuredArtworkId:'w1',status:'published'};
 assert.equal((await call('record','PUT',{collection:'showings',id:'show-1',payload:show,revision:0},artistUser)).status,200);
 await new Promise(resolve=>setTimeout(resolve,300));
 const firstNotice=await db.prepare('SELECT recipients FROM showing_notices WHERE showing_id=?1').bind('show-1').first();
 assert.equal(firstNotice?.recipients,0,'an unconfirmed follower is not emailed');

 const token=(await follower('fan@example.com')).token;
 assert.equal((await post('follow/confirm',{token})).status,200,'the confirm link works');
 assert.equal((await follower('fan@example.com')).status,'confirmed');
 const list=await (await call(`followers?artist=${id}`,'GET',undefined,artistUser)).json();
 assert.deepEqual(list.followers.map(f=>f.email),['fan@example.com'],'the artist sees confirmed followers');
 assert.deepEqual((await (await call('followers','GET',undefined,{userId:'user_other',administrator:false})).json()).error!==undefined,true,'an account with no artist gets none');

 const second={...show,id:'show-2',venue:'FPO gallery'};
 assert.equal((await call('record','PUT',{collection:'showings',id:'show-2',payload:second,revision:0},artistUser)).status,200);
 await new Promise(resolve=>setTimeout(resolve,300));
 assert.equal((await db.prepare('SELECT recipients FROM showing_notices WHERE showing_id=?1').bind('show-2').first())?.recipients,1,'a confirmed follower is counted');
 assert.equal((await call('record','PUT',{collection:'showings',id:'show-2',payload:{...second,city:'Medford'},revision:1},artistUser)).status,200);
 await new Promise(resolve=>setTimeout(resolve,300));
 assert.equal((await db.prepare('SELECT count(*) AS n FROM showing_notices').first()).n,2,'editing a published showing sends nothing new');

 assert.equal((await post('follow/unsubscribe',{token})).status,200,'the unsubscribe link works');
 assert.equal((await follower('fan@example.com')).status,'unsubscribed');
 const third={...show,id:'show-3',venue:'FPO café'};
 await call('record','PUT',{collection:'showings',id:'show-3',payload:third,revision:0},artistUser);
 await new Promise(resolve=>setTimeout(resolve,300));
 assert.equal((await db.prepare('SELECT recipients FROM showing_notices WHERE showing_id=?1').bind('show-3').first())?.recipients,0,'an unsubscribed follower hears nothing');
 assert.equal((await post('follow/confirm',{token:'0'.repeat(48)})).status,404,'a made-up token is refused');
 console.log('Followers passed: double opt-in, one notice per showing, unsubscribe honored, artist-only list.');
}finally{await mf.dispose()}
