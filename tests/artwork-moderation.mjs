import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const TERMS=(await fs.readFile('community-api/terms.ts','utf8')).match(/TERMS_VERSION = '([^']+)'/)[1];
// Sample pieces at application, the "Made with AI" label, the administrator's Hide,
// and visitors' "Report this".
const security=await build({entryPoints:['community-api/security.ts'],bundle:true,write:false,format:'esm',platform:'node'});
const {signCapability}=await import('data:text/javascript;base64,'+Buffer.from(security.outputFiles[0].text).toString('base64'));
const secret='isolated-test-secret-with-no-production-use';
const admin={userId:'test-admin',administrator:true};
const compiled=await build({entryPoints:['community-api/index.ts'],bundle:true,write:false,format:'esm',platform:'neutral',target:'es2022'});
const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-09-17',d1Databases:{DB:'moderation-database'},r2Buckets:['ARTWORK'],bindings:{COMMUNITY_GATEWAY_SECRET:secret}}));
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await fs.readdir('community-api/migrations')).sort())await db.exec((await fs.readFile(`community-api/migrations/${file}`,'utf8')).replace(/^--.*$/gm,'').replace(/\n/g,' '));
 await db.exec("INSERT OR IGNORE INTO community_memberships(user_id,administrator) VALUES('test-admin',1);");
 async function call(path,method='GET',body,principal=admin){
  const bytes=body===undefined?new Uint8Array():body instanceof Uint8Array?body:new TextEncoder().encode(JSON.stringify(body));
  const capability=await signCapability(secret,principal,method,`/api/community/${path.split('?')[0]}`,bytes);
  return mf.dispatchFetch(`http://localhost/api/community/${path}`,{method,headers:{'x-aaj-prototype':'local','x-aaj-capability':capability.value,'x-aaj-signature':capability.signature,'Content-Type':'application/json'},body:method==='GET'?undefined:bytes});
 }
 const jpeg=new Uint8Array([255,216,255,224,0,16,74,70,73,70]);
 const publicArtist=async id=>(await (await mf.dispatchFetch('http://localhost/api/community/public/state')).json()).records.find(r=>r.collection==='artists'&&r.id===id)?.payload;
 const page=async id=>JSON.parse((await db.prepare("SELECT payload FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).payload);
 const revision=async id=>(await db.prepare("SELECT revision FROM community_records WHERE collection='artists' AND id=?1").bind(id).first()).revision;
 const alerts=async()=>(await db.prepare('SELECT count(*) AS n FROM admin_notifications').first()).n;

 // Applying, then sending sample pieces.
 const artistUser={userId:'user_mia',administrator:false};
 const {id}=await (await call('applications','PUT',{kind:'artist',payload:{name:'Mia Chen',email:'mia@example.com',regionId:'region-rogue-valley',city:'Medford',practice:'Painting',portfolio:'',note:'Oil paintings',opportunities:false,agreeTerms:true,termsVersion:TERMS}},artistUser)).json();
 assert.equal(await alerts(),0,'the administrator isn’t alerted until the pieces arrive');
 for(const key of ['s1','s2','s3'])assert.equal((await call(`images/${key}`,'PUT',jpeg,artistUser)).status,200,'the applicant can upload right away');
 assert.ok((await call('images/intruder','PUT',jpeg,{userId:'user_other',administrator:false})).status>=400,'an account with no page can’t upload');
 const samples=keys=>({action:'samples',id,works:keys.map((imageKey,i)=>({imageKey,title:`Piece ${i+1}`,madeWithAI:i===2}))});
 assert.equal((await call('applications','PUT',samples(['s1']),artistUser)).status,400,'one piece isn’t enough');
 assert.equal((await call('applications','PUT',samples(['s1','s2','s3','s1']),artistUser)).status,400,'four is too many');
 assert.equal((await call('applications','PUT',samples(['s1','nobody']),artistUser)).status,400,'every piece must be the applicant’s own upload');
 assert.equal((await call('applications','PUT',samples(['s1','s2']),{userId:'user_other',administrator:false})).status,403,'only the applicant can send pieces');
 assert.equal((await call('applications','PUT',samples(['s1','s2','s3']),artistUser)).status,200,'two or three pieces go through');
 assert.equal((await call('applications','PUT',samples(['s1','s2']),artistUser)).status,409,'the pieces are sent once');
 assert.equal(await alerts(),1,'now the administrator is alerted');
 const withSamples=await page(id);
 assert.deepEqual(withSamples.works.map(w=>w.title),['Piece 1','Piece 2','Piece 3'],'the pieces are the first on the page');
 assert.ok(withSamples.works.every(w=>w.public),'they’ll show once the page goes public');
 const inbox=(await (await call('applications')).json()).applications.find(a=>a.id===id);
 assert.deepEqual(inbox.samples.map(w=>w.imageKey),['s1','s2','s3'],'the inbox shows the pieces');
 assert.equal(inbox.samples[2].madeWithAI,true,'with their AI label');
 assert.equal((await (await call('applications','GET',undefined,artistUser)).json()).applications[0].samples,undefined,'applicants don’t get the admin view');
 assert.equal((await call('images/s1','GET')).status,200,'the administrator can see the images');

 // Approved and published.
 await call('applications','PUT',{action:'review',kind:'artist',id,status:'approved'});
 const edited={...await page(id),published:true};
 edited.works[0]={...edited.works[0],sale:'price',price:'450'};
 edited.works[1]={...edited.works[1],madeWithAI:'yes',hiddenByAdmin:true,publicAt:'1999-01-01T00:00:00Z'};
 assert.equal((await call('record','PUT',{collection:'artists',id,payload:edited,revision:await revision(id)},artistUser)).status,200);
 let shown=await publicArtist(id);
 assert.equal(shown.works.length,3,'an artist can’t hide their own piece through the admin flag');
 assert.equal(shown.works[0].price,'450','a price the artist chose to show is public');
 assert.equal(shown.works[1].madeWithAI,false,'only a real yes counts as the AI label');
 assert.equal(shown.works[2].madeWithAI,true,'the AI label is public');
 assert.notEqual((await page(id)).works[1].publicAt,'1999-01-01T00:00:00Z','the storage service keeps its own dates');

 // New work, and Hide.
 const newWork=async principal=>call('admin/new-work','GET',undefined,principal);
 assert.equal((await newWork(artistUser)).status,403,'only an administrator sees New work');
 const listed=(await (await newWork(admin)).json()).items;
 assert.equal(listed.length,3,'every live piece is listed');
 const target=listed.find(item=>item.title==='Piece 2');
 assert.equal((await call('admin/new-work','PUT',{artistId:id,workId:target.workId,hidden:true},artistUser)).status,403,'an artist can’t use Hide');
 assert.equal((await call('admin/new-work','PUT',{artistId:id,workId:target.workId,hidden:true})).status,200,'Hide works');
 shown=await publicArtist(id);
 assert.ok(!shown.works.some(w=>w.id===target.workId),'a hidden piece leaves the public page');
 assert.equal((await mf.dispatchFetch('http://localhost/api/community/public/images/s2')).status,404,'and its image stops being served');
 const unhide={...await page(id)};unhide.works=unhide.works.map(w=>({...w,hiddenByAdmin:false}));
 await call('record','PUT',{collection:'artists',id,payload:unhide,revision:await revision(id)},artistUser);
 assert.ok(!(await publicArtist(id)).works.some(w=>w.id===target.workId),'the artist can’t unhide it');
 assert.ok((await (await newWork(admin)).json()).items.find(item=>item.workId===target.workId).hidden,'hidden pieces stay listed, so a hide can be undone');
 await call('admin/new-work','PUT',{artistId:id,workId:target.workId,hidden:false});
 assert.ok((await publicArtist(id)).works.some(w=>w.id===target.workId),'Unhide puts it back');

 // Report this.
 const report=(body,client='203.0.113.7')=>mf.dispatchFetch('http://localhost/api/community/public/report',{method:'POST',headers:{'x-aaj-prototype':'local','Content-Type':'application/json','x-aaj-client':client},body:JSON.stringify({artistId:id,workId:target.workId,reason:'not-art',details:'It’s a mug.',email:'',website:'',elapsed:5000,...body})});
 const reports=async()=>(await db.prepare('SELECT count(*) AS n FROM artwork_reports').first()).n;
 assert.equal((await report({reason:'because'})).status,400,'a reason from the list is required');
 assert.equal((await report({workId:'missing'})).status,404,'only public pieces can be reported');
 assert.equal((await report({website:'http://spam.example'})).status,200);
 assert.equal((await report({elapsed:100})).status,200);
 assert.equal(await reports(),0,'bot traps drop reports quietly');
 assert.equal((await report({})).status,200,'a visitor can report a piece');
 for(let i=0;i<4;i++)await report({});
 assert.equal((await report({})).status,429,'five reports an hour from one visitor');
 assert.equal((await call('admin/reports','GET',undefined,artistUser)).status,403,'only an administrator sees reports');
 let open=(await (await call('admin/reports')).json()).reports;
 assert.equal(open.length,5);
 assert.equal(open[0].title,'Piece 2');assert.equal(open[0].reasonLabel,'It’s a craft or a product, not art');
 assert.equal((await call('admin/reports','PUT',{id:open[0].id,action:'dismiss'})).status,200);
 assert.equal((await (await call('admin/reports')).json()).reports.length,4,'dismiss closes one report');
 open=(await (await call('admin/reports')).json()).reports;
 assert.equal((await call('admin/reports','PUT',{id:open[0].id,action:'hide'})).status,200);
 assert.equal((await (await call('admin/reports')).json()).reports.length,0,'hiding the piece settles every report about it');
 assert.ok(!(await publicArtist(id)).works.some(w=>w.id===target.workId),'and the piece is off the site');
 console.log('Artwork moderation passed: sample pieces, AI label, New work with Hide, Report this.');
}finally{await mf.dispose()}
